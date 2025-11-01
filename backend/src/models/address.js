const { Addresses } = require("../schemas/addresses.js");

module.exports.createAddress = async (addressInfo) => {
  const results = await Addresses.create({
    address_line_1: addressInfo.addressLine1,
    address_line_2: addressInfo.addressLine2,
    country: addressInfo.country,
    state: addressInfo.state,
    city: addressInfo.city,
    postal_code: addressInfo.postalCode,
  });

  return results.address_id;
};

module.exports.findAddressByFK = async (addressID) => {
  const results = await Addresses.findByPk(addressID);

  return results;
};

module.exports.updateAddress = async (addressID, meta) => {
  await Addresses.update(
    {
      ...meta,
    },
    {
      where: {
        address_id: addressID,
      },
    }
  );
};
