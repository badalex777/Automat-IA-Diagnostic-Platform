import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, TrendingUp, Clock, DollarSign, Download, Calendar, Info } from 'lucide-react';
import { useState } from 'react';
import { scenarioMultipliers, ScenarioType, ProcessInfo, PeopleAndCost, TimeSavings, QualityImpact, RevenueUplift, CostsAndRampup } from '@shared/schema';
import { generateWordDocument } from '@/lib/wordDocumentGenerator';
import { generateOperatorGuide } from '@/lib/operatorGuideGenerator';
import { MultiYearResults, formatPaybackPeriod } from '@/lib/multiYearCalculations';

interface ROIResults {
  roiPercentage: number; // Backward compatibility (same as runRateROI)
  runRateROI: number; // Annual run-rate ROI (steady-state, post-ramp-up)
  year1ActualROI: number; // Year 1 ROI with ramp-up applied
  year1RampFactor: number; // Ramp-up factor for Year 1
  year1Benefits: number; // Year 1 ramped benefits
  year1NetBenefit: number; // Year 1 ramped net benefit
  paybackMonths: number;
  annualBenefits: number;
  annualCosts: number;
  netBenefit: number;
  hoursSavedWeekly: number;
  hoursSavedAnnually: number;
  ftesSaved: number;
  timeSavings: number;
  qualitySavings: number;
  revenueSavings: number;
  
  // Granular Quality Impact Metrics
  errorReductionPercent: number;
  errorsAvoidedAnnually: number;
  qualityImprovementPercent: number;
  currentErrorRate: number;
  postAIErrorRate: number;
  
  // Granular Revenue Uplift Metrics
  hoursReallocatedAnnually: number;
  revenueReallocationPercent: number;
  
  // Granular Time Savings Metrics
  timeSavingsPercent: number;
  
  // Multi-year projections
  multiYear?: MultiYearResults;
}

interface AllData {
  processInfo: ProcessInfo;
  peopleAndCost: PeopleAndCost;
  timeSavings: TimeSavings;
  qualityImpact: QualityImpact;
  revenueUplift: RevenueUplift;
  costsAndRampup: CostsAndRampup;
}

interface ResultsDashboardProps {
  results: ROIResults;
  selectedScenario: ScenarioType;
  onViewFormula: () => void;
  onScenarioChange: (scenario: ScenarioType) => void;
  calculateROI: (scenario: ScenarioType) => ROIResults;
  allData: AllData;
}

const scenarioNames: Record<ScenarioType, string> = {
  best: 'Best Case',
  base: 'Base Case',
  conservative: 'Conservative',
  worst: 'Worst Case',
};

export default function ResultsDashboard({ results, selectedScenario, onViewFormula, onScenarioChange, calculateROI, allData }: ResultsDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [selectedYear, setSelectedYear] = useState<1 | 3 | 5>(1);
  
  // Get selected year's metrics from multi-year projections
  const getYearMetrics = () => {
    if (!results.multiYear || selectedYear === 1) {
      // Year 1: use Year 1 ramped values (with ramp-up applied)
      return {
        roi: results.year1ActualROI,
        payback: results.multiYear?.paybackMonths || results.paybackMonths,
        netBenefit: results.year1NetBenefit,
        annualBenefits: results.year1Benefits,
        annualCosts: results.annualCosts,
        cumulativeBenefits: results.year1Benefits,
        cumulativeCosts: results.annualCosts,
        isCumulative: false,
      };
    }
    
    // yearlyProjections contains [Year 1, Year 3, Year 5] at indices [0, 1, 2]
    // Map selectedYear to correct index
    const yearProjection = results.multiYear.yearlyProjections.find(p => p.year === selectedYear);
    
    if (!yearProjection) {
      // Fallback to Year 1 ramped values if projection not found
      return {
        roi: results.year1ActualROI,
        payback: results.multiYear.paybackMonths,
        netBenefit: results.year1NetBenefit,
        annualBenefits: results.year1Benefits,
        annualCosts: results.annualCosts,
        cumulativeBenefits: results.year1Benefits,
        cumulativeCosts: results.annualCosts,
        isCumulative: false,
      };
    }
    
    return {
      roi: yearProjection.cumulativeROI,
      payback: results.multiYear.paybackMonths,
      netBenefit: yearProjection.cumulativeNetBenefit,
      annualBenefits: yearProjection.benefits,
      annualCosts: yearProjection.costs,
      cumulativeBenefits: yearProjection.cumulativeBenefits,
      cumulativeCosts: yearProjection.cumulativeCosts,
      isCumulative: true,
    };
  };
  
  const yearMetrics = getYearMetrics();
  
  // Generate comprehensive report data for download
  const generateReportData = () => {
    const allScenarios = Object.keys(scenarioMultipliers).reduce((acc, key) => {
      acc[key] = calculateROI(key as ScenarioType);
      return acc;
    }, {} as Record<string, ROIResults>);
    
    return {
      reportTitle: 'Automat-IA ROI Analysis Report',
      generatedDate: new Date().toLocaleDateString(),
      productName: 'ROI Calculator - Automat-IA',
      company: 'Automat-IA',
      processInfo: allData.processInfo,
      peopleAndCost: allData.peopleAndCost,
      timeSavings: allData.timeSavings,
      qualityImpact: allData.qualityImpact,
      revenueUplift: allData.revenueUplift,
      costsAndRampup: allData.costsAndRampup,
      scenarios: allScenarios,
      selectedScenario,
      formulas: {
        effectiveHourlyRate: '(Annual Salary / Annual Working Hours) × Overhead Multiplier',
        timeSavings: 'Total Hours Per Week × (% Time Saved / 100) × Scenario Multiplier × 52 weeks × Effective Hourly Rate',
        qualityImpact: '(Error Rate Reduction × Transactions Per Week × 52 / 100) × Scenario Multiplier × (Rework Hours Per Error × Effective Hourly Rate + Financial Cost Per Error). Error Rate Reduction = % Quality Improvement × Current Error Rate OR (Current Error Rate - Post-AI Error Rate)',
        revenueUplift: 'Hours Saved Weekly × 52 × (% Reallocated / 100) × Scenario Multiplier × Revenue Value Per Hour',
        totalBenefits: 'Time Savings + Quality Impact + Revenue Uplift',
        totalCosts: '(Implementation + Annual Software + Training + Change Management) × Scenario Cost Multiplier',
        roi: '((Annual Benefits - Annual Costs) / Annual Costs) × 100',
        payback: 'Annual Costs / (Annual Benefits / 12)'
      }
    };
  };
  
  const downloadROIInsights = async () => {
    const reportData = generateReportData();
    
    // Generate and download Word document
    await generateWordDocument(reportData, results, formatCurrency);
  };
  
  const scenario = scenarioMultipliers[selectedScenario];
  

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Multi-Year Selector */}
      {results.multiYear && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Projection Timeframe:</span>
              </div>
              <Tabs value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v) as 1 | 3 | 5)}>
                <TabsList>
                  <TabsTrigger value="1" data-testid="tab-year-1">Year 1</TabsTrigger>
                  <TabsTrigger value="3" data-testid="tab-year-3">Year 3</TabsTrigger>
                  <TabsTrigger value="5" data-testid="tab-year-5">Year 5</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {yearMetrics.isCumulative && (
              <p className="text-xs text-muted-foreground mt-2">
                Showing cumulative ROI over {selectedYear} years with Year 1 ramp-up modeling ({Math.round(results.multiYear.year1RampFactor * 100)}% of full benefits in Year 1)
              </p>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Hero Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="border-primary/20 bg-primary/5 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Return on Investment
              </CardDescription>
              <Badge variant="outline" className={scenario.color}>
                {scenarioNames[selectedScenario]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Year 1 Actual ROI (with ramp-up) */}
              <div className="space-y-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 cursor-help">
                      Year 1 ROI (With Ramp-Up)
                      <Info className="h-3 w-3" />
                    </p>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The actual ROI you'll achieve in Year 1, accounting for the implementation ramp-up period. Benefits are pro-rated based on your {Math.round(results.year1RampFactor * 100)}% ramp factor.</p>
                  </TooltipContent>
                </Tooltip>
                <div className="text-3xl font-bold text-primary" data-testid="text-year1-actual-roi">
                  {formatPercentage(results.year1ActualROI)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Realistic first-year return
                </p>
              </div>
              
              {/* Annual Run-Rate ROI (steady-state) */}
              <div className="space-y-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 cursor-help">
                      Annual Run-Rate ROI
                      <Info className="h-3 w-3" />
                    </p>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The steady-state ROI once the implementation is fully operational. This represents the annual return you'll achieve each year after the ramp-up period.</p>
                  </TooltipContent>
                </Tooltip>
                <div className="text-3xl font-bold text-primary" data-testid="text-runrate-roi">
                  {formatPercentage(results.runRateROI)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Steady-state return (Years 2+)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Payback Period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400" data-testid="text-payback-months">
              {results.multiYear ? formatPaybackPeriod(yearMetrics.payback) : `${results.paybackMonths.toFixed(1)} months`}
            </div>
            <p className="text-sm text-muted-foreground">Time to breakeven</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {yearMetrics.isCumulative ? 'Cumulative Net Benefit' : 'Net Benefit'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-net-benefit">
              {formatCurrency(yearMetrics.netBenefit)}
            </div>
            <p className="text-sm text-muted-foreground">
              {yearMetrics.isCumulative ? `Over ${selectedYear} years` : 'Annual'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>ROI Analysis Results</CardTitle>
              <CardDescription>
                Based on {scenarioNames[selectedScenario]} scenario assumptions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowBreakdown(!showBreakdown)}
                data-testid="button-toggle-breakdown"
                className="hover-elevate"
              >
                {showBreakdown ? 'Hide Breakdown' : 'Show Breakdown'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onViewFormula}
                data-testid="button-view-formula"
                className="hover-elevate"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Formula
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm font-medium flex items-center gap-1 cursor-help">
                    Hours Saved
                    <Info className="h-3 w-3" />
                  </p>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Steady-state hours saved per week once the AI solution is fully operational (post-ramp-up). Year 1 may achieve less due to implementation timeline.</p>
                </TooltipContent>
              </Tooltip>
              <p className="text-2xl font-bold" data-testid="text-hours-saved-weekly">
                {results.hoursSavedWeekly.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">per week</p>
            </div>
            
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm font-medium flex items-center gap-1 cursor-help">
                    FTE Equivalent
                    <Info className="h-3 w-3" />
                  </p>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Full-time equivalent employees saved based on steady-state time savings (40 hours/week). Represents capacity freed up once fully operational.</p>
                </TooltipContent>
              </Tooltip>
              <p className="text-2xl font-bold" data-testid="text-ftes-saved">
                {results.ftesSaved.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">employees</p>
            </div>
            
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm font-medium flex items-center gap-1 cursor-help">
                    Annual Benefits
                    <Info className="h-3 w-3" />
                  </p>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    {selectedYear === 1 
                      ? `Year 1 benefits are reduced to ${Math.round(results.multiYear?.year1RampFactor ? results.multiYear.year1RampFactor * 100 : results.year1RampFactor * 100)}% of full value due to implementation ramp-up and efficiency factors. Years 2+ achieve 100% of steady-state benefits.`
                      : `Steady-state annual benefits for Year ${selectedYear}, representing 100% of the full value once fully operational.`
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
              <p className="text-2xl font-bold text-green-600" data-testid="text-annual-benefits">
                {formatCurrency(yearMetrics.annualBenefits)}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedYear === 1 ? 'Year 1 (ramped)' : `Year ${selectedYear}`}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Annual Costs</p>
              <p className="text-2xl font-bold text-red-600" data-testid="text-annual-costs">
                {formatCurrency(yearMetrics.annualCosts)}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedYear === 1 ? 'With implementation' : 'Software only'}
              </p>
            </div>
          </div>

          {showBreakdown && (
            <div className="mt-6 pt-6 border-t animate-in slide-in-from-top-2">
              <h4 className="font-semibold mb-4">Benefits Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Time Savings</p>
                  <p className="font-semibold" data-testid="text-time-savings">
                    {formatCurrency(results.timeSavings)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Quality Impact</p>
                  <p className="font-semibold" data-testid="text-quality-savings">
                    {formatCurrency(results.qualitySavings)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Revenue Uplift</p>
                  <p className="font-semibold" data-testid="text-revenue-savings">
                    {formatCurrency(results.revenueSavings)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Business Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Business Metrics</CardTitle>
          <CardDescription>
            Granular metrics showing specific business improvements from AI implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Quality Impact Metrics */}
            {allData.qualityImpact.enabled && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Quality Impact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Error Reduction</p>
                    <p className="text-lg font-bold" data-testid="text-error-reduction-percent">
                      {formatPercentage(results.errorReductionPercent)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Errors Avoided Annually</p>
                    <p className="text-lg font-bold" data-testid="text-errors-avoided">
                      {results.errorsAvoidedAnnually.toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">per year</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Quality Improvement</p>
                    <p className="text-lg font-bold" data-testid="text-quality-improvement-percent">
                      {formatPercentage(results.qualityImprovementPercent)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Current Error Rate</p>
                    <p className="text-lg font-bold" data-testid="text-current-error-rate">
                      {formatPercentage(results.currentErrorRate)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Post-AI Error Rate</p>
                    <p className="text-lg font-bold text-green-600" data-testid="text-post-ai-error-rate">
                      {formatPercentage(results.postAIErrorRate)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Generation Metrics */}
            {allData.revenueUplift.enabled && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Revenue Generation</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Hours Reallocated to Revenue</p>
                    <p className="text-lg font-bold" data-testid="text-hours-reallocated">
                      {results.hoursReallocatedAnnually.toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">hours/year</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Revenue Reallocation</p>
                    <p className="text-lg font-bold" data-testid="text-reallocation-percent">
                      {formatPercentage(results.revenueReallocationPercent)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Revenue Uplift</p>
                    <p className="text-lg font-bold text-green-600" data-testid="text-revenue-generated">
                      {formatCurrency(results.revenueSavings)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Time Efficiency Metrics */}
            {allData.timeSavings.enabled && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Time Efficiency</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Time Savings</p>
                    <p className="text-lg font-bold" data-testid="text-time-saved-percent">
                      {formatPercentage(results.timeSavingsPercent)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Hours Saved per week</p>
                    <p className="text-lg font-bold" data-testid="text-time-hours-saved-weekly">
                      {results.hoursSavedWeekly.toFixed(1)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Annual Hours Saved</p>
                    <p className="text-lg font-bold text-green-600" data-testid="text-time-hours-saved-annually">
                      {results.hoursSavedAnnually.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Scenario Comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Scenario Comparison</CardTitle>
              <CardDescription>
                How different assumptions affect your ROI
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={downloadROIInsights}
                className="gap-2"
                data-testid="button-download-insights"
              >
                <Download className="h-4 w-4" />
                Download ROI Insights
              </Button>
              <Button 
                onClick={() => generateOperatorGuide()}
                variant="outline"
                className="gap-2"
                data-testid="button-download-operator-guide"
              >
                <Download className="h-4 w-4" />
                Download Operator Guide
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Click any scenario to see real-time ROI changes
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(scenarioMultipliers).map(([key, scenario]) => {
                const isSelected = key === selectedScenario;
                const scenarioResults = calculateROI(key as ScenarioType);
                return (
                  <Button
                    key={key}
                    variant={isSelected ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col gap-3 hover-elevate justify-start items-start"
                    onClick={() => onScenarioChange(key as ScenarioType)}
                    data-testid={`button-scenario-comparison-${key}`}
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="font-semibold text-left">{scenarioNames[key as ScenarioType]}</span>
                        {isSelected && <Badge variant="secondary">Selected</Badge>}
                      </div>
                      <p className="text-xs text-left opacity-80 mb-3 leading-relaxed">
                        {scenario.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 w-full text-xs">
                        <div className="text-left">
                          <div className={`font-medium ${isSelected ? 'text-primary-foreground' : 'text-primary'}`}>{formatPercentage(scenarioResults.runRateROI)}</div>
                          <div className="opacity-70">ROI</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${isSelected ? 'text-primary-foreground' : 'text-green-600'}`}>{formatCurrency(scenarioResults.netBenefit)}</div>
                          <div className="opacity-70">Net Benefit</div>
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{scenarioResults.multiYear ? formatPaybackPeriod(scenarioResults.multiYear.paybackMonths) : `${scenarioResults.paybackMonths.toFixed(1)}mo`}</div>
                          <div className="opacity-70">Payback</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(scenarioResults.year1Benefits)}</div>
                          <div className="opacity-70">Year 1 Benefits</div>
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}