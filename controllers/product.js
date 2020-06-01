const Product = require("../models/product");
const Group = require("../models/group");
const ObjectId = require("mongodb").ObjectID;
const { uploadImage } = require("../utils/AWS");
const _ = require("lodash");

const fetchProducts = async ctx => {
  const { skip = 0, limit = 1000000, search = "", completed, supplier, brand, status } = ctx.query;
  const fields = ["name"];
  const populate = ["price"];

  const productOptions = {
    isArchived: false,
  };

  if (completed !== undefined) {
    productOptions.isCompleted = JSON.parse(completed);
  }

  if (brand) {
    productOptions.brand = new ObjectId(brand);
  }

  const priceOptions = {
    isArchived: false,
  };

  const supplierOptions = {
    isArchived: false,
  }

  const filtersMatch = {}

  if (supplier) {
    filtersMatch["price.supplier._id"] = new ObjectId(supplier);
  }

  if (status !== undefined) {
    filtersMatch["price.status"] = JSON.parse(status);
  }

  const aggregateQuery = [
    {
      $match: {
        $and: [productOptions],
        $or: fields.map(field => ({ [field]: { $regex: search, $options: "ig" } })),
      },
    },
    {
      $lookup: {
        from: "prices",
        let: { product_price: "$price" },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ["$_id", "$$product_price"] }, priceOptions] } } },
          {
            $lookup: {
              from: "suppliers",
              let: { price_supplier: "$supplier" },
              pipeline: [
                { $match: { $expr: { $and: [{ $eq: ["$_id", "$$price_supplier"] }, supplierOptions] } } },
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
    { $match: filtersMatch },
    { $skip: skip * limit },
    { $limit: Number(limit) },
  ];

  try {
    const products = await Product.aggregate(aggregateQuery);
    ctx.body = products;
  } catch (err) {
    ctx.throw(err);
  }
};

const updateProduct = async ctx => {
  const product = ctx.request.body;
  const { productId } = ctx.params;

  try {
    const updatedProduct = await Product.findByIdAndUpdate({ _id: productId }, product, { new: true });
    ctx.body = updatedProduct;
  } catch (err) {
    ctx.throw(err);
  }
};

const fetchProductsForShop = async ctx => {
  const { skip = 0, limit = 100000, search = "", is_new, popular } = ctx.query;
  const fields = ["name"];
  const productOptions = {
    isCompleted: true,
  };

  const priceOptions = {
    isArchived: false,
  };

  try {
    const aggregateQuery = [
      {
        $match: {
          $and: [productOptions],
          $or: fields.map(field => ({ [field]: { $regex: search, $options: "ig" } })),
        },
      },
      {
        $lookup: {
          from: "prices",
          let: { product_price: "$price" },
          pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$_id", "$$product_price"] }, priceOptions] } } }],
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
      { $skip: skip * limit },
      { $limit: Number(limit) },
    ];

    if (is_new) {
      aggregateQuery.unshift({ $sort: { createdAt: 1 } });
    }

    if (popular) {
      aggregateQuery.unshift({ $sort: { "price.orderCount": 1 } });
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
                pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$_id", "$$product_price"] }, priceOptions] } } }],
                as: "price",
              },
            },
            { $unwind: "$price" },
            {
              $lookup: {
                from: "brands",
                let: { product_brand: "$brand" },
                pipeline: [
                  { $match: { $expr: { $and: [{ $eq: ["$_id", "$$product_brand"] }, { isArchived: false }] } } },
                ],
                as: "brand",
              },
            },
            { $unwind: "$brand" },
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

const fetchProductForShop = async ctx => {
  const { productId } = ctx.params;

  const priceOptions = {
    isArchived: false,
  };

  try {
    const aggregateQuery = [
      {
        $match: { _id: new ObjectId(productId) },
      },
      {
        $lookup: {
          from: "prices",
          let: { product_price: "$price" },
          pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$_id", "$$product_price"] }, priceOptions] } } }],
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
                  { $match: { $expr: { $and: [{ $eq: ["$_id", "$$product_price"] }, priceOptions] } } },
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

    ctx.body = products[0];
  } catch (err) {
    ctx.throw(err);
  }
};

const groupProducts = async ctx => {
  const { options } = ctx.request.body;
  const { supplierId } = ctx.params;
  const { user } = ctx.decoded;

  try {
    const newGroup = new Group({
      supplierId,
      createdBy: user._id,
      products: options.map(opt => opt.id),
    });

    newGroup._id = new ObjectId();
    const savedGroup = await newGroup.save();

    const groupedProducts = await Product.bulkWrite(
      options.map(opt => {
        return {
          updateOne: {
            filter: { _id: opt.id },
            update: { $set: { group: savedGroup._id } },
            upsert: true,
          },
        };
      }),
    );

    ctx.body = _.orderBy(groupedProducts, ["weight"], ["desc"]);
  } catch (err) {
    ctx.throw(err);
  }
};

const getGroupedProducts = async ctx => {
  const { supplierId } = ctx.params;

  try {
    const groups = await Group.find({ supplierId, isArchived: false });

    ctx.body = groups;
  } catch (err) {
    ctx.throw(err);
  }
};

const fetchProductsByIds = async ctx => {
  const { product } = ctx.query;

  const productIds = product.split("?product=");

  try {
    const products = await Product.find({ _id: { $in: productIds } }, { _id: 1, name: 1, images: 1 });
    ctx.body = products;
  } catch (err) {
    ctx.throw(err);
  }
};

module.exports = {
  fetchProducts,
  fetchProductForShop,
  fetchProductsForShop,
  updateProduct,
  groupProducts,
  getGroupedProducts,
  fetchProductsByIds,
};
