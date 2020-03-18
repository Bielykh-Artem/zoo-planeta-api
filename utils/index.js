const getUID = () => {
  const uniqNumber = new Date().getTime() + Math.floor(Math.random() * 100)
  return uniqNumber
}

module.exports = {
  getUID,
}
