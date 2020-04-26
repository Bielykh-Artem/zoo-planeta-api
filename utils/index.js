const getUID = () => {
  const uniqNumber = Math.floor(100000 + Math.random() * 900000);
  return uniqNumber;
};

module.exports = {
  getUID,
};
