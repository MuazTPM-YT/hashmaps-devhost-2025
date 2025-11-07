import duckdb
import pandas as pd
from decimal import Decimal

class EmissionDataProcessor:
    def __init__(self):
        self.conn = duckdb.connect(':memory:')
    
    def analyze_trends(self, company_data):
        if not company_data:
            return []
        
        df = pd.DataFrame(company_data)
        self.conn.register('emissions', df)
        query = """
        SELECT
            strftime('%Y', CAST(trip_date AS DATE)) as year,
            SUM(emissions_kg_co2) as total_emissions,
            AVG(emissions_kg_co2) as avg_emissions,
            COUNT(*) as trip_count
        FROM emissions
        GROUP BY year
        ORDER BY year DESC
        """

        result = self.conn.execute(query).fetchdf()
        trends = result.to_dict('records')
        
        for i in range(len(trends) - 1):
            current_year = trends[i]
            previous_year = trends[i + 1]
            
            growth = ((current_year['total_emissions'] - previous_year['total_emissions']) 
                     / previous_year['total_emissions'] * 100)
            
            trends[i]['yoy_growth_percentage'] = round(growth, 2)
            trends[i]['is_increasing'] = growth > 0
        
        if trends:
            trends[-1]['yoy_growth_percentage'] = 0
            trends[-1]['is_increasing'] = False
        
        return trends
    
    def check_threshold_breach(self, company_data, threshold_kg):
        if not company_data:
            return []
        
        df = pd.DataFrame(company_data)
        self.conn.register('emissions', df)
        
        query = f"""
            SELECT 
                strftime('%Y', CAST(trip_date AS DATE)) as year,
                SUM(emissions_kg_co2) as yearly_emissions,
                CASE 
                    WHEN SUM(emissions_kg_co2) > {threshold_kg} 
                    THEN true 
                    ELSE false 
                END as exceeds_threshold,
                (SUM(emissions_kg_co2) - {threshold_kg}) as excess_emissions
            FROM emissions
            GROUP BY year
            ORDER BY year DESC
        """

        
        result = self.conn.execute(query).fetchdf()
        return result.to_dict('records')
    
    def calculate_vehicle_efficiency(self, company_data):
        if not company_data:
            return []
        
        df = pd.DataFrame(company_data)
        self.conn.register('emissions', df)
        
        query = """
            SELECT 
                vehicle_type,
                COUNT(*) as trips,
                SUM(emissions_kg_co2) as total_emissions,
                AVG(emissions_kg_co2) as avg_emissions_per_trip,
                SUM(distance_km) as total_distance,
                SUM(emissions_kg_co2) / SUM(distance_km) as emissions_per_km
            FROM emissions
            GROUP BY vehicle_type
            ORDER BY total_emissions DESC
        """
        
        result = self.conn.execute(query).fetchdf()
        return result.to_dict('records')
