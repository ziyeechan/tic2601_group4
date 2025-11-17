const {
  findSeatingPlanByID,
  findSeatingPlanByTableNum,
  findSeatingPlanByRestaurantID,
  createSeatingPlan,
  updateSeatingPlanByID,
  deleteSeatingPlanByID,
} = require("../models/seatingPlan");

module.exports.createSeatingPlan = async (req, res) => {
  try {
    const restaurantID = parseInt(req.params.restaurantID);
    if (isNaN(restaurantID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });
    const { pax, tableType, tableNumber } = req.body;

    //Check if pax, tableType, tableNumber are present
    if (!pax || !tableType || !tableNumber) {
      return res.status(400).json({ message: "Missing Fields" });
    }

    const seatingInfo = { pax, tableType, tableNumber };
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

module.exports.findSeatingPlanByID = async (req, res) => {
  try {
    const seatingID = parseInt(req.params.seatingID);

    if (isNaN(seatingID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const results = await findSeatingPlanByID(seatingID);
    
    if (!results) {
      return res.status(404).json({ message: "Seating Plan not found" });
    }
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

module.exports.updateSeatingPlanByID = async (req, res) => {
  try {
    const seatingID = parseInt(req.params.seatingID);
    if (isNaN(seatingID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const { pax, tableNumber, tableType, isAvailable } = req.body;
    
    if (pax || tableNumber || tableType || isAvailable) {
      const formattedData = {
        pax: pax,
        tableType: tableType,
        tableNumber: tableNumber,
        isAvailable: isAvailable,
      };

      await updateSeatingPlanByID(seatingID, formattedData);
      return res
        .status(200)
        .send("New Seating Plan has been successfully updated");
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send("Something went wrong! Contact your local administrator");
  }
};

module.exports.deleteSeatingPlanByID = async (req, res) => {
  try {
    const seatingID = parseInt(req.params.seatingID);
    if (isNaN(seatingID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    await deleteSeatingPlanByID(seatingID);
    return res.status(200).send(" Seating Plan has been successfully deleted");
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send("Something went wrong! Contact your local administrator");
  }
};
