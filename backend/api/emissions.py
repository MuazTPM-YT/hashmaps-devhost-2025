from decimal import Decimal

EMISSION_FACTORS = {
    'DIESEL': Decimal('0.636'),
    'PETROL': Decimal('0.580'),

    'EV_SOLAR': Decimal('0.050'),
    'EV_NUCLEAR': Decimal('0.080'),
    'EV_GRID': Decimal('0.235'),
}

WEIGHT_FACTOR = Decimal('0.05')

def calculate_emissions(vehicle_type: str, distance_km: Decimal, weight_tonnes: Decimal) -> Decimal:
    base_factor = EMISSION_FACTORS.get(vehicle_type, EMISSION_FACTORS['DIESEL'])
    base_emissions = base_factor * distance_km
    weight_emissions = WEIGHT_FACTOR * distance_km * weight_tonnes
    total_emissions = base_emissions + weight_emissions

    return round(total_emissions, 3)


def calculate_emissions_savings(current_emissions: Decimal, baseline_emissions: Decimal) -> dict:
    if baseline_emissions == 0:
        return {
            'savings_kg': Decimal('0'),
            'savings_percentage': Decimal('0'),
            'savings_tonnes': Decimal('0'),
        }
 
    savings_kg = baseline_emissions - current_emissions
    savings_percentage = (savings_kg / baseline_emissions) * 100
    savings_tonnes = savings_kg / 1000
 
    return {
        'savings_kg': round(savings_kg, 2),
        'savings_percentage': round(savings_percentage, 2),
        'savings_tonnes': round(savings_tonnes, 3),
    }


def calculate_penalty_risk(total_emissions_kg: Decimal, threshold_kg: Decimal, turnover: Decimal) -> dict:
    exceeds_threshold = total_emissions_kg > threshold_kg
    
    if exceeds_threshold:
        potential_penalty = turnover * Decimal('0.05')
        excess_emissions = total_emissions_kg - threshold_kg
        excess_percentage = (excess_emissions / threshold_kg) * 100
    else:
        potential_penalty = Decimal('0')
        excess_emissions = Decimal('0')
        excess_percentage = Decimal('0')
    
    return {
        'exceeds_threshold': exceeds_threshold,
        'potential_penalty_eur': round(potential_penalty, 2),
        'excess_emissions_kg': round(excess_emissions, 2),
        'excess_percentage': round(excess_percentage, 2),
        'threshold_kg': threshold_kg,
    }


def calculate_financing_impact(esg_score: float, turnover: Decimal) -> dict:
    base_rate = Decimal('0.05')
    esg_adjustment = Decimal(str(esg_score / 100)) * Decimal('0.02')
    adjusted_rate = base_rate - esg_adjustment
    annual_borrowing = turnover * Decimal('0.3')

    base_cost = annual_borrowing * base_rate
    adjusted_cost = annual_borrowing * adjusted_rate
    annual_savings = base_cost - adjusted_cost
 
    return {
        'base_rate': float(base_rate),
        'adjusted_rate': float(adjusted_rate),
        'rate_reduction': float(esg_adjustment),
        'annual_savings_eur': round(annual_savings, 2),
        'esg_score': esg_score,
    }

