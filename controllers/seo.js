const MainSeo = require("../models/mainSeo");
const ObjectId = require("mongodb").ObjectID;

const saveMainShopSeo = async ctx => {
  const seoSettings = ctx.request.body;
  const { user } = ctx.decoded;

  try {
    const result = await MainSeo.bulkWrite(
      Object.keys(seoSettings).map(key => {
        const data = {
          id: new ObjectId(),
          createdBy: user._id,
          menuId: new ObjectId(key),
          text: seoSettings[key].text || "",
          shortText: seoSettings[key].shortText || "",
        };

        return {
          updateOne: {
            filter: { menuId: data.menuId },
            update: { $set: data },
            upsert: true,
          },
        };
      }),
    );

    ctx.body = result;
  } catch (err) {
    ctx.throw(err);
  }
};

const fetchMainShopSeo = async ctx => {
  try {
    const result = await MainSeo.find();
    ctx.body = result;
  } catch (err) {
    ctx.throw(err);
  }
};

module.exports = {
  saveMainShopSeo,
  fetchMainShopSeo,
};
