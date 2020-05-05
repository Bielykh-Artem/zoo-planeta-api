const ObjectId = require("mongodb").ObjectID;
const Menu = require("../models/menu");
const Product = require("../models/product");
const _ = require("lodash");

const getCategory = (menu, assigned) => {
  return menu.find(menuItem => {
    if (assigned == menuItem._id) {
      return menuItem;
    }

    if (menuItem.children.length && menuItem._id !== assigned) {
      return getCategory(menuItem.children, assigned);
    }

    return false;
  });
};

const getAssignedIds = (menuTreePart, assignedIds) => {
  if (menuTreePart.children.length) {
    menuTreePart.children.forEach(ch => getAssignedIds(ch, assignedIds));
  }

  assignedIds.push(String(menuTreePart._id));
};

const fetchProducts = async ctx => {
  const {
    advancedSearch: { skip, limit, filters, searchStr },
    query: { catalogId },
  } = ctx.request.body;
  const assignedIds = [];

  const fields = ["name"];

  try {
    const menuTree = await Menu.find().sort({ order: 1 });
    const menuTreePart = getCategory(menuTree, catalogId);

    getAssignedIds(menuTreePart, assignedIds);

    const options = { isCompleted: true };

    const aggregateQuery = [
      {
        $match: {
          $and: [options],
          $or: fields.map(field => ({ [field]: { $regex: searchStr, $options: "ig" } })),
        },
      },
      { $skip: skip * limit },
      { $limit: Number(limit) },
      {
        $redact: {
          $cond: [
            {
              $setIsSubset: ["$assigned", assignedIds],
            },
            "$$KEEP",
            "$$PRUNE",
          ],
        },
      },
      {
        $lookup: {
          from: "prices",
          let: { product_price: "$price" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$product_price"] }, { isArchived: false }],
                },
              },
            },
          ],
          as: "price",
        },
      },
      { $unwind: "$price" },
      {
        $lookup: {
          from: "brands",
          let: { product_brand: "$brand" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$product_brand"] }, { isArchived: false }],
                },
              },
            },
          ],
          as: "brand",
        },
      },
      { $unwind: "$brand" },
      {
        $group: {
          _id: { $ifNull: ["$group", "$_id"] },
          doc: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: { $mergeObjects: [{ _id: "$_id" }, "$doc"] } },
      },
    ];

    if (filters && filters.length) {
      filters.forEach(f => {
        /**
         * Filter By Product Brand
         */
        if (f.type === "IN" && f.values.length) {
          aggregateQuery[0].$match[f.field] = { $in: f.values.map(v => new ObjectId(v)) };
        }

        /**
         * Filter By Product Range
         */
        if (f.type === "RANGE") {
          aggregateQuery.push({ $match: { [f.field]: { $gte: Number(f.values.min), $lt: Number(f.values.max) } } });
        }

        /**
         * Filter by Product Charactiristics
         */
        if (f.type === "OPTIONS") {
          f.values.forEach(opt => {
            for (let i in opt) {
              if (opt[i] && opt[i].options.length) {
                if (opt[i].type === 2) {
                  // TODO now it work like OR but need change to AND
                  aggregateQuery.push({
                    $redact: {
                      $cond: [
                        {
                          $setIsSubset: [`$${f.field}.${i}`, opt[i].options],
                        },
                        "$$KEEP",
                        "$$PRUNE",
                      ],
                    },
                  });
                } else if (opt[i].type === 1) {
                  aggregateQuery[0].$match[`${f.field}.${i}`] = { $in: opt[i].options };
                }
              }
            }
          });
        }
      });
    }

    const products = await Product.aggregate(aggregateQuery);

    await Promise.all(
      products.map(async product => {
        if (product.group) {
          const aggregateQuery = [
            {
              $match: {
                $and: [{ isArchived: false, group: product.group }],
              },
            },
            {
              $lookup: {
                from: "prices",
                let: { product_price: "$price" },
                pipeline: [
                  { $match: { $expr: { $and: [{ $eq: ["$_id", "$$product_price"] }, { isArchived: false }] } } },
                  {
                    $lookup: {
                      from: "suppliers",
                      let: { price_supplier: "$supplier" },
                      pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$_id", "$$price_supplier"] }] } } },
                        {
                          $lookup: {
                            from: "users",
                            let: { supplier_user: "$createdBy" },
                            pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$_id", "$$supplier_user"] }] } } }],
                            as: "createdBy",
                          },
                        },
                        { $unwind: "$createdBy" },
                      ],
                      as: "supplier",
                    },
                  },
                  { $unwind: "$supplier" },
                ],
                as: "price",
              },
            },
            { $unwind: "$price" },
          ];

          const groupedProducts = await Product.aggregate(aggregateQuery);

          delete product.price;
          delete product.createdBy;
          delete product.isArchived;
          delete product.name;
          delete product.group;

          product.groupedProducts = _.orderBy(groupedProducts, ["weight"], ["desc"]);
        }

        return product;
      }),
    );

    ctx.body = products;
  } catch (err) {
    ctx.throw(err);
  }
};
const fetchFilteredProducts = async ctx => {
  const data = ctx.request.body;

  console.log("data", data);
};

module.exports = {
  fetchProducts,
  fetchFilteredProducts,
};
