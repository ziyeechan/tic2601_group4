const { Addresses } = require("../schemas/addresses.js");

module.exports.findAllAddresses = async () => {
  return await Addresses.findAll();
};

module.exports.findAddressByID = async (addressID) => {
  return await Addresses.findByPk(addressID);
};

module.exports.createAddress = async (addressInfo) => {
  return await Addresses.create({
    addressLine1: addressInfo.addressLine1,
    addressLine2: addressInfo.addressLine2,
    country: addressInfo.country,
    state: addressInfo.state,
    city: addressInfo.city,
    postalCode: addressInfo.postalCode,
  });
};

module.exports.updateAddress = async (addressID, meta) => {
  const [affectedCount] = await Addresses.update({ ...meta }, { where: { addressId: addressID } });
  if (!affectedCount) return null;
  return await Addresses.findByPk(addressID);
};

module.exports.deleteAddress = async (addressID) => {
  return await Addresses.destroy({
    where: { addressId: addressID },
  });
};
