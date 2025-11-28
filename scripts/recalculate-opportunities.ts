import { db } from "../server/db";
import { implementationOpportunities } from "../shared/schema";
import { calculateROI } from "../shared/roiCalculations";
import { isNotNull, eq } from "drizzle-orm";
import type { ROICalculation } from "../shared/schema";

async function recalculateAllOpportunities() {
  console.log("Starting opportunity recalculation...\n");

  const opportunities = await db
    .select()
    .from(implementationOpportunities)
    .where(isNotNull(implementationOpportunities.roiCalculationData));

  console.log(`Found ${opportunities.length} opportunities with ROI calculation data\n`);

  let updated = 0;
  let failed = 0;

  for (const opp of opportunities) {
    try {
      const roiData = opp.roiCalculationData as ROICalculation;
      if (!roiData || !roiData.peopleAndCost) {
        console.log(`Skipping ${opp.name} - invalid roiCalculationData structure`);
        continue;
      }

      const scenario = roiData.selectedScenario || "conservative";
      const results = calculateROI(roiData, scenario);

      if (!results) {
        console.log(`Skipping ${opp.name} - calculateROI returned null`);
        continue;
      }

      // Get cumulative values from yearly projections
      const year3Projection = results.multiYear?.yearlyProjections?.find(p => p.year === 3);
      const year5Projection = results.multiYear?.yearlyProjections?.find(p => p.year === 5);
      const cumulative3Year = year3Projection?.cumulativeNetBenefit || 0;
      const cumulative5Year = year5Projection?.cumulativeNetBenefit || 0;

      console.log(`\n--- ${opp.name} ---`);
      console.log(`  Scenario: ${scenario}`);
      console.log(`  OLD values: ROI=${opp.annualRoi}%, RunRate=${opp.annualRunRateRoi}%, Payback=${opp.paybackPeriodMonths} months`);
      console.log(`  NEW values: ROI=${results.year1ActualROI.toFixed(2)}%, RunRate=${results.runRateROI.toFixed(2)}%, Payback=${results.paybackMonths.toFixed(2)} months`);
      console.log(`  Annual Benefits: $${results.annualBenefits.toFixed(0)}`);
      console.log(`  Annual Costs: $${results.annualCosts.toFixed(0)}`);
      console.log(`  Time Savings: $${results.timeSavings.toFixed(0)}`);
      console.log(`  Quality Savings: $${results.qualitySavings.toFixed(0)}`);
      console.log(`  Revenue Savings: $${results.revenueSavings.toFixed(0)}`);

      await db
        .update(implementationOpportunities)
        .set({
          annualRoi: results.year1ActualROI.toFixed(2),
          annualRunRateRoi: results.runRateROI.toFixed(2),
          paybackPeriodMonths: results.paybackMonths.toFixed(2),
          hoursSavedPerWeek: results.hoursSavedWeekly.toFixed(2),
          annualHoursSaved: results.hoursSavedAnnually.toFixed(2),
          fteSavings: results.ftesSaved.toFixed(2),
          errorsAvoidedAnnually: results.errorsAvoidedAnnually,
          hoursReallocatedToRevenue: results.hoursReallocatedAnnually.toFixed(2),
          revenueUpliftAnnual: results.revenueSavings.toFixed(2),
          rampupPeriodMonths: (roiData.costsAndRampup?.rampUpMonths || 6).toString(),
          implementationCost: results.annualCosts.toFixed(2),
          cumulativeNetBenefit3Year: cumulative3Year.toFixed(2),
          cumulativeNetBenefit5Year: cumulative5Year.toFixed(2),
        })
        .where(eq(implementationOpportunities.id, opp.id));

      updated++;
      console.log(`  Updated successfully`);
    } catch (error) {
      console.error(`  Failed to update ${opp.name}:`, error);
      failed++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${opportunities.length}`);

  process.exit(0);
}

recalculateAllOpportunities().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
