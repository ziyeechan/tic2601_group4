const { Addresses } = require("../schemas/addresses.js");

module.exports.createAddress = async (addressInfo) => {
  const results = await Addresses.create({
    addressLine1: addressInfo.addressLine1,
    addressLine2: addressInfo.addressLine2,
    country: addressInfo.country,
    state: addressInfo.state,
    city: addressInfo.city,
    postalCode: addressInfo.postalCode,
  });

  return results.addressId;
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
        addressId: addressID,
      },
    }
  );
};
