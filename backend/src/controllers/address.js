const {
    findAllAddresses,
    findAddressByID,
    createAddress,
    updateAddressID,
    deleteAddressByID,
} = require("../models/address");
  
module.exports.findAllAddresses = async (req, res) => {
  try {
    const address = await findAllAddresses();
    return res.status(200).json(address);
  } catch (err) {
    console.log(err);
  }
};

module.exports.findAddressByID = async (req, res) => {
  try {
    const addressID = parseInt(req.params.addressID);
    if (isNaN(addressID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const address = await findAddressByID(addressID);

    return res.status(200).json({
      address,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.createAddress = async (req, res) => {
  try {
    const { addressLine1, addressLine2, country, state, city, postalCode } = req.body;

    if (!addressLine1 || !country || !city || !postalCode) {
      return res.status(400).json({ message: "Missing required address fields" });
    }

    const newAddress = await createAddress({ addressLine1, addressLine2, country, state, city, postalCode });

    return res.status(200).json({ message: "Address has been created", address: newAddress });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.updateAddress = async (req, res) => {
  try {
    const addressId = parseInt(req.params.addressId);
    const { addressLine1, addressLine2, country, state, city, postalCode } = req.body;

    if (isNaN(addressId)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }

    const updated = await updateAddress(addressId, { addressLine1, addressLine2, country, state, city, postalCode });

    if (!updated) {
      return res.status(404).json({ message: "Address not found" });
    }

    return res.status(200).json({ message: "Address has been updated", address: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.deleteAddress = async (req, res) => {
  try {
    const addressId = parseInt(req.params.addressId);

    if (isNaN(addressId)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }

    const deleted = await deleteAddress(addressId);

    if (!deleted) {
      return res.status(404).json({ message: "Address not found" });
    }

    return res.status(200).json({ message: "Address has been deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
