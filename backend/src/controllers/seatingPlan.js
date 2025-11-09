const {
  findSeatingPlanByPK,
  findSeatingPlanByTableNum,
  findSeatingPlanByRestaurantID,
  createSeatingPlan,
  updateSeatingPlanByPK,
  deleteSeatingPlanByPK,
} = require("../models/seatingPlan");

module.exports.createSeatingPlan = async (req, res) => {
  try {
    const restaurantID = parseInt(req.params.restaurantID);
    if (isNaN(restaurantID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });
    const { pax, tableType, tableNum } = req.body;
    const seatingInfo = { pax, tableType, tableNum };
    await createSeatingPlan(seatingInfo, restaurantID);
    return res
      .status(200)
      .send("New Seating Plan has been successfully created");
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send("Something went wrong! Contact your local administrator");
  }
};

module.exports.findSeatingPlanByTableNum = async (req, res) => {
  try {
    const restaurantID = parseInt(req.params.restaurantID);
    const tableNum = req.params.tableNum;
    if (isNaN(restaurantID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const results = await findSeatingPlanByTableNum(tableNum, restaurantID);

    return res.status(200).json({
      results,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send("Something went wrong! Contact your local administrator");
  }
};

module.exports.findSeatingPlanByRestaurantID = async (req, res) => {
  try {
    const restaurantID = parseInt(req.params.restaurantID);
    if (isNaN(restaurantID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const results = await findSeatingPlanByRestaurantID(restaurantID);

    return res.status(200).json({
      results,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send("Something went wrong! Contact your local administrator");
  }
};

module.exports.findSeatingPlanByPK = async (req, res) => {
  try {
    const seatingID = parseInt(req.params.seatingID);
    console.log(seatingID);
    if (isNaN(seatingID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const results = await findSeatingPlanByPK(seatingID);

    return res.status(200).json({
      results,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send("Something went wrong! Contact your local administrator");
  }
};

module.exports.updateSeatingPlanByPK = async (req, res) => {
  try {
    const seatingID = parseInt(req.params.seatingID);
    if (isNaN(seatingID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const { pax, tableNum, tableType, isAvail } = req.body;

    if (pax || tableNum || tableType || isAvail) {
      const formattedData = {
        pax: pax,
        tableType: tableType,
        tableNumber: tableNum,
        isAvailable: isAvail,
      };

      await updateSeatingPlanByPK(seatingID, formattedData);
      return res
        .status(200)
        .send("New Seating Plan has been successfully updated");
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports.deleteSeatingPlanByPK = async (req, res) => {
  try {
    const seatingID = parseInt(req.params.seatingID);
    if (isNaN(seatingID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    await deleteSeatingPlanByPK(seatingID);
    return res.status(200).send(" Seating Plan has been successfully deleted");
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send("Something went wrong! Contact your local administrator");
  }
};
