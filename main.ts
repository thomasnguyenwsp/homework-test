import {
  GetProductsForIngredient,
  GetRecipes,
} from "./supporting-files/data-access";
import { Product, Recipe } from "./supporting-files/models";
import {
  GetCostPerBaseUnit,
  GetNutrientFactInBaseUnits,
} from "./supporting-files/helpers";
import { RunTest, ExpectedRecipeSummary } from "./supporting-files/testing";

console.clear();
console.log("Expected Result Is:", ExpectedRecipeSummary);

const recipeData = GetRecipes(); // the list of 1 recipe you should calculate the information for
const recipeSummary: any = {}; // the final result to pass into the test function

/*
 * YOUR CODE GOES BELOW THIS, DO NOT MODIFY ABOVE
 * (You can add more imports if needed)
 * */

function formatSummary(summary: any) {
  const { nutrientsAtCheapestCost } = summary;
  summary.nutrientsAtCheapestCost = Object.keys(nutrientsAtCheapestCost)
    .sort()
    .reduce((objEntries, key) => {
      objEntries[key] = nutrientsAtCheapestCost[key];

      return objEntries;
    }, {});

  return summary;
}

function getCheapestProduct(products: Product[]) {
  let cheapestProduct;

  for (const product of products) {
    const cheapestCost = product.supplierProducts
      .map(GetCostPerBaseUnit)
      .sort()
      .shift();

    if (!cheapestCost) continue;
    const nutrientsAtCheapestCost = product.nutrientFacts.map(
      GetNutrientFactInBaseUnits
    );

    if (!cheapestProduct) {
      cheapestProduct = {
        cheapestCost,
        nutrientFacts: nutrientsAtCheapestCost,
      };
    }

    if (cheapestProduct && cheapestCost < cheapestProduct.cheapestCost) {
      cheapestProduct = {
        cheapestCost,
        nutrientFacts: nutrientsAtCheapestCost,
      };
    }
  }

  if (!cheapestProduct) {
    return {
      cheapestCost: 0,
      nutrientFacts: [],
    };
  }
  return cheapestProduct;
}

function getCheapestCostAndSummaryRecipe(recipe: Recipe) {
  let summary = {
    cheapestCost: 0,
    nutrientsAtCheapestCost: {},
  };

  for (const item of recipe.lineItems) {
    const products = GetProductsForIngredient(item.ingredient);
    // Get the product with the cheapest base unit cost
    const cheapestProduct = getCheapestProduct(products);

    // Calculate the minimum cost for the item
    summary.cheapestCost +=
      item.unitOfMeasure.uomAmount * cheapestProduct.cheapestCost;

    // Its nutritional information summary in cheapest configuration.
    for (const nutrientFact of cheapestProduct.nutrientFacts) {
      const { nutrientName } = nutrientFact;
      const nutrientSummary = summary.nutrientsAtCheapestCost[nutrientName];
      if (!nutrientSummary) {
        summary.nutrientsAtCheapestCost[nutrientName] = nutrientFact;
        continue;
      }

      if (nutrientSummary) {
        nutrientSummary.quantityAmount.uomAmount +=
          nutrientFact.quantityAmount.uomAmount;
      }
    }
  }

  return summary;
}

for (const recipe of recipeData) {
  const summary = getCheapestCostAndSummaryRecipe(recipe);
  recipeSummary[recipe.recipeName] = formatSummary(summary);
}

/*
 * YOUR CODE ABOVE THIS, DO NOT MODIFY BELOW
 * */
RunTest(recipeSummary);
