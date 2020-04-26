const ObjectId = require("mongodb").ObjectID;
const Menu = require("../models/menu");
const Product = require("../models/product");

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
  } else {
    assignedIds.push(menuTreePart._id);
  }
};

const fetchProducts = async ctx => {
  const {
    query: { catalogId },
  } = ctx.request.body;
  const assignedIds = [];

  try {
    const menuTree = await Menu.find().sort({ order: 1 });
    const menuTreePart = getCategory(menuTree, catalogId);

    getAssignedIds(menuTreePart, assignedIds);

    const aggregateQuery = [
      { $match: { isCompleted: true } },
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
          pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$_id", "$$product_price"] }, { isArchived: false }] } } }],
          as: "price",
        },
      },
      { $unwind: "$price" },
      {
        $lookup: {
          from: "brands",
          let: { product_brand: "$brand" },
          pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$_id", "$$product_brand"] }, { isArchived: false }] } } }],
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

          product.groupedProducts = groupedProducts;
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
