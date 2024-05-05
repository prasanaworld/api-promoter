const express = require("express");
const apiRouter = express.Router();
const { performTest } = require("./playwright");

function chooseItemWithProbability(items) {
  const totalWeight = items.reduce((acc, item) => acc + item.weight, 0);
  const randomValue = Math.random() * totalWeight;
  let cumulativeWeight = 0;

  for (const item of items) {
    cumulativeWeight += item.weight;
    if (randomValue <= cumulativeWeight) {
      return item;
    }
  }

  // If somehow no item was chosen, return the last item
  return items[items.length - 1];
}

const requestWeight = [
  {
    request: 0,
    weight: 70,
  },
  {
    request: 1,
    weight: 15,
  },
  {
    request: 3,
    weight: 7,
  },
  {
    request: 4,
    weight: 5,
  },
  {
    request: 7,
    weight: 3,
  },
];

apiRouter.get("", async (req, res) => {
  const noOfRequest = chooseItemWithProbability(requestWeight);

  const response = {
    noOfRequest: noOfRequest,
    result: [],
  };

  for (let i = 0; i < noOfRequest.request; i++) {
    try {
      await performTest(`${i}/${noOfRequest.request}`);
      response.result.push("success");
    } catch (e) {
      response.result.push(`Failed: ${e}`);
    }
  }

  res.json(response);
});

module.exports = apiRouter;
