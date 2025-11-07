import google.generativeai as genai
import json

class CarbonComplianceAdvisor:
    def __init__(self, api_key):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-pro')

    def _clean_json_response(self, text):
        text = text.strip()
        if text.startswith('```'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
        return text.strip()
    
    def analyze_and_suggest(self, emission_trends, company_info, threshold_status=None):
        threshold_text = ""
        if threshold_status:
            breaches = [t for t in threshold_status if t.get('exceeds_threshold')]
            if breaches:
                threshold_text = f"\nTHRESHOLD BREACHES: {len(breaches)} years exceeded 10,000 tonnes limit"
        prompt = f"""
You are an ESG compliance advisor for Nordic companies under EU CSRD regulations.

COMPANY INFORMATION:
- Name: {company_info['name']}
- Country: {company_info['country']}
- Annual Turnover: €{company_info['annual_turnover']:,.2f}
- Current ESG Score: {company_info['esg_score']}/100

EMISSION TRENDS (Last 3 Years):
{json.dumps(emission_trends, indent=2)}
{threshold_text}

EU CSRD COMPLIANCE REQUIREMENTS:
- Companies must reduce emissions by 10% year-over-year
- Emissions above 10,000 tonnes CO2/year face penalties up to 5% of annual revenue
- Companies with ESG score < 50 face higher financing costs
- Green credits can offset emissions and improve loan rates

PLANTATION OFFSET INFO:
- Companies with forests/plantations can earn carbon credits
- Each tree absorbs ~21 kg CO2/year
- Green credits improve ESG score and reduce loan interest rates by up to 2%

YOUR TASKS:
1. Analyze if emissions are increasing or decreasing year-over-year
2. Calculate potential EU fines if current trend continues
3. Determine if company is eligible for green credits (plantations)
4. Suggest 3 specific, actionable steps to reduce emissions
5. Calculate potential savings from better loan rates if ESG improves
6. Ask user for confirmation to take automated actions

IMPORTANT: Respond ONLY in valid JSON format (no markdown, no extra text):
{{
  "risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "is_compliant": true or false,
  "trend_analysis": "2-3 sentence analysis of emission trends",
  "potential_fine_eur": 0,
  "years_non_compliant": 0,
  "suggestions": [
    {{"action": "specific suggestion 1", "impact": "estimated CO2 reduction", "cost": "implementation cost"}},
    {{"action": "specific suggestion 2", "impact": "estimated CO2 reduction", "cost": "implementation cost"}},
    {{"action": "specific suggestion 3", "impact": "estimated CO2 reduction", "cost": "implementation cost"}}
  ],
  "green_credits_eligible": true or false,
  "green_credits_info": "explanation if eligible, or suggestion to plant trees",
  "financing_benefits": {{
    "current_rate": "5.0%",
    "improved_rate": "4.5%",
    "annual_savings_eur": 0
  }},
  "user_prompt": "Would you like me to [specific automated action]? Please confirm."
}}
"""
        try:
            response = self.model.generate_content(prompt)
            text = self._clean_json_response(response.text)
            advice = json.loads(text)
            return {
                'success': True,
                'advice': advice,
                'raw_response': text
            }
        except json.JSONDecodeError as e:
            return {
                'success': False,
                'error': f'Failed to parse AI response: {str(e)}',
                'raw_response': response.text if 'response' in locals() else None
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'AI analysis error: {str(e)}'
            }

    def calculate_plantation_offset(self, emission_data, plantation_info):
        prompt = f"""
Calculate carbon offset for a company:

EMISSIONS:
- Total Annual Emissions: {emission_data.get('total_emissions_kg', 0):,.0f} kg CO2

PLANTATION ASSETS:
- Plantation Area: {plantation_info.get('area_hectares', 0)} hectares
- Tree Count: {plantation_info.get('tree_count', 0)} trees
- Tree Species: {plantation_info.get('species', 'Mixed Nordic Forest')}

CALCULATION RULES:
- Each tree absorbs approximately 21 kg CO2 per year
- 1 carbon credit = 1 tonne CO2 offset
- Green credits can reduce loan interest rates by 0.5-2% depending on ESG score improvement

Calculate and return JSON:
{{
  "carbon_absorbed_kg": 0,
  "carbon_credits_earned": 0,
  "net_emissions_after_offset": 0,
  "offset_percentage": 0,
  "esg_score_improvement": 0,
  "loan_rate_reduction": "0.5%",
  "annual_savings_eur": 0,
  "recommendation": "Should company expand plantations? Why?",
  "trees_needed_for_net_zero": 0
}}
"""
        try:
            response = self.model.generate_content(prompt)
            text = self._clean_json_response(response.text)
            offset_calc = json.loads(text)
            return {
                'success': True,
                'offset_calculation': offset_calc
            }
        except json.JSONDecodeError as e:
            return {
                'success': False,
                'error': f'Failed to parse plantation AI response: {str(e)}',
                'raw_response': response.text if 'response' in locals() else None
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'AI plantation offset error: {str(e)}'
            }
