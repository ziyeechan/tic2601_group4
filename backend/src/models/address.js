const { Addresses } = require("../schemas/addresses.js");

module.exports.findAllAddresses = async () => {
  return await Addresses.findAll();
};

module.exports.findAddressesByID = async (addressID) => {
  return await Addresses.findByPk(addressID);
};

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

module.exports.deleteAddress = async (addressID) => {
  return await Addresses.destroy({
    where: { addressId: addressID },
  });
};
