const { SeatingPlans } = require("../schemas/seatingPlans");

module.exports.findSeatingPlanByTableNum = async (tableNum, restaurantID) => {
  const results = await SeatingPlans.findOne({
    where: { tableNumber: tableNum, fkRestaurantId: restaurantID },
  });

  return results;
};

module.exports.findSeatingPlanByRestaurantID = async (restaurantID) => {
  const results = await SeatingPlans.findAll({
    where: { fkRestaurantId: restaurantID },
  });

  return results;
};

module.exports.findSeatingPlanByID = async (seatingID) => {
  const results = await SeatingPlans.findByPk(seatingID);

  return results;
};

module.exports.createSeatingPlan = async (seatingInfo, restaurantID) => {
  await SeatingPlans.create({
    pax: seatingInfo.pax,
    tableType: seatingInfo.tableType,
    tableNumber: seatingInfo.tableNumber,
    fkRestaurantId: restaurantID,
  });
};

module.exports.updateSeatingPlanByID = async (seatingID, meta) => {
  await SeatingPlans.update(
    { ...meta },
    {
      where: { seatingId: seatingID },
    }
  );
};

module.exports.deleteSeatingPlanByID = async (seatingID) => {
  await SeatingPlans.destroy({
    where: { seatingId: seatingID },
  });
};
