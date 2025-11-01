const { SeatingPlans } = require("../schemas/seatingPlans");

module.exports.findSeatingPlanByTableNum = async (tableNum, restaurantID) => {
  const results = await SeatingPlans.findOne({
    where: { table_number: tableNum, fk_restaurant_id: restaurantID },
  });

  return results;
};

module.exports.findSeatingPlanByRestaurantID = async (restaurantID) => {
  const results = await SeatingPlans.findAll({
    where: { fk_restaurant_id: restaurantID },
  });

  return results;
};

module.exports.findSeatingPlanByPK = async (seatingID) => {
  const results = await SeatingPlans.findByPk(seatingID);

  return results;
};

module.exports.createSeatingPlan = async (seatingInfo, restaurantID) => {
  console.log(seatingInfo);
  await SeatingPlans.create({
    pax: seatingInfo.pax,
    table_type: seatingInfo.tableType,
    table_number: seatingInfo.tableNum,
    fk_restaurant_id: restaurantID,
  });
};

module.exports.updateSeatingPlanByPK = async (seatingID, meta) => {
  await SeatingPlans.update(
    { ...meta },
    {
      where: { seating_id: seatingID },
    }
  );
};

module.exports.deleteSeatingPlanByPK = async (seatingID) => {
  await SeatingPlans.destroy({
    where: { seating_id: seatingID },
  });
};
