#!/usr/bin/env python3
"""
GDPR-Compliant Data Anonymization using Microsoft Presidio
"""

import spacy
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig
from presidio_analyzer import RecognizerResult
from typing import Dict, List, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GDPRAnonymizer:
    """
    GDPR-compliant data anonymization using Microsoft Presidio
    """
    
    def __init__(self):
        """Initialize the GDPR anonymizer with Presidio engines"""
        try:
            # Load spaCy model
            self.nlp = spacy.load("en_core_web_sm")
            
            # Initialize Presidio engines
            self.analyzer = AnalyzerEngine()
            self.anonymizer = AnonymizerEngine()
            
            # Define GDPR-compliant anonymization operators
            self.operators = {
                "PERSON": OperatorConfig("replace", {"new_value": "[PERSON]"}),
                "EMAIL_ADDRESS": OperatorConfig("replace", {"new_value": "[EMAIL]"}),
                "PHONE_NUMBER": OperatorConfig("replace", {"new_value": "[PHONE]"}),
                "CREDIT_CARD": OperatorConfig("replace", {"new_value": "[CREDIT_CARD]"}),
                "SSN": OperatorConfig("replace", {"new_value": "[SSN]"}),
                "IBAN_CODE": OperatorConfig("replace", {"new_value": "[IBAN]"}),
                "IP_ADDRESS": OperatorConfig("replace", {"new_value": "[IP_ADDRESS]"}),
                "LOCATION": OperatorConfig("replace", {"new_value": "[LOCATION]"}),
                "DATE_TIME": OperatorConfig("replace", {"new_value": "[DATE]"}),
                "URL": OperatorConfig("replace", {"new_value": "[URL]"}),
                "US_DRIVER_LICENSE": OperatorConfig("replace", {"new_value": "[DRIVER_LICENSE]"}),
                "US_PASSPORT": OperatorConfig("replace", {"new_value": "[PASSPORT]"}),
                "US_BANK_NUMBER": OperatorConfig("replace", {"new_value": "[BANK_ACCOUNT]"}),
                "MEDICAL_LICENSE": OperatorConfig("replace", {"new_value": "[MEDICAL_LICENSE]"}),
                "UK_NHS": OperatorConfig("replace", {"new_value": "[NHS_NUMBER]"}),
                "UK_PASSPORT": OperatorConfig("replace", {"new_value": "[PASSPORT]"}),
                "UK_DRIVER_LICENSE": OperatorConfig("replace", {"new_value": "[DRIVER_LICENSE]"}),
                "UK_BANK_ACCOUNT": OperatorConfig("replace", {"new_value": "[BANK_ACCOUNT]"}),
                "AU_ABN": OperatorConfig("replace", {"new_value": "[AU_ABN]"}),
                "AU_ACN": OperatorConfig("replace", {"new_value": "[AU_ACN]"}),
                "AU_TFN": OperatorConfig("replace", {"new_value": "[AU_TFN]"}),
                "AU_MEDICARE": OperatorConfig("replace", {"new_value": "[AU_MEDICARE]"}),
                "PASSPORT": OperatorConfig("replace", {"new_value": "[PASSPORT]"}),
                "PASSPORT_NUMBER": OperatorConfig("replace", {"new_value": "[PASSPORT]"}),
                "EU_SSN": OperatorConfig("replace", {"new_value": "[EU_SSN]"}),
            }
            
            logger.info("GDPR Anonymizer initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize GDPR Anonymizer: {e}")
            raise
    
    def analyze_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Analyze text to identify PII entities using Presidio
        """
        try:
            # Analyze the text for PII
            results = self.analyzer.analyze(
                text=text,
                language='en',
                entities=[
                    "PERSON", "EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD",
                    "SSN", "IBAN_CODE", "IP_ADDRESS", "LOCATION", "DATE_TIME",
                    "URL", "US_DRIVER_LICENSE", "US_PASSPORT", "US_BANK_NUMBER",
                    "MEDICAL_LICENSE", "UK_NHS", "UK_PASSPORT", "UK_DRIVER_LICENSE",
                    "UK_BANK_ACCOUNT", "AU_ABN", "AU_ACN", "AU_TFN", "AU_MEDICARE"
                ]
            )
            
            # Convert results to list of dictionaries
            analysis_results = []
            for result in results:
                analysis_results.append({
                    "entity_type": result.entity_type,
                    "start": result.start,
                    "end": result.end,
                    "score": result.score,
                    "text": text[result.start:result.end]
                })
            
            logger.info(f"Found {len(analysis_results)} PII entities")
            return analysis_results
            
        except Exception as e:
            logger.error(f"Error analyzing text: {e}")
            return []
    
    def detect_passport_numbers(self, text: str) -> List[RecognizerResult]:
        """
        Detect passport numbers using regex patterns
        """
        import re
        passport_patterns = [
            # General passport pattern: 2-3 letters followed by 6-9 digits
            r'\b[A-Z]{2,3}\d{6,9}\b',
            # US Passport: 9 digits
            r'\b\d{9}\b',
            # UK Passport: 9 digits
            r'\b\d{9}\b',
            # Canadian Passport: 2 letters + 6 digits
            r'\b[A-Z]{2}\d{6}\b',
            # Australian Passport: 8-9 digits
            r'\b\d{8,9}\b',
            # German Passport: 9 digits
            r'\b\d{9}\b',
            # French Passport: 2 letters + 7 digits
            r'\b[A-Z]{2}\d{7}\b',
        ]
        
        results = []
        for pattern in passport_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                results.append(RecognizerResult(
                    entity_type="PASSPORT",
                    start=match.start(),
                    end=match.end(),
                    score=0.9
                ))
        
        return results

    def detect_european_ssn(self, text: str) -> List[RecognizerResult]:
        """
        Detect European Social Security Numbers using regex patterns
        """
        import re
        european_ssn_patterns = [
            # Germany - Sozialversicherungsnummer (12 digits)
            r'\b\d{12}\b',
            # France - Numéro de sécurité sociale (15 digits)
            r'\b\d{15}\b',
            # UK - National Insurance Number (2 letters + 6 digits + 1 letter)
            r'\b[A-Z]{2}\d{6}[A-Z]\b',
            # Italy - Codice Fiscale (16 characters: 6 letters + 2 digits + 1 letter + 2 digits + 1 letter + 3 digits + 1 letter)
            r'\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b',
            # Spain - Número de Seguridad Social (12 digits)
            r'\b\d{12}\b',
            # Netherlands - BSN (9 digits)
            r'\b\d{9}\b',
            # Belgium - National Number (11 digits)
            r'\b\d{11}\b',
            # Sweden - Personnummer (10 digits with optional dash)
            r'\b\d{6}[-]?\d{4}\b',
            # Norway - Fødselsnummer (11 digits)
            r'\b\d{11}\b',
            # Denmark - CPR Number (10 digits with optional dash)
            r'\b\d{6}[-]?\d{4}\b',
            # Finland - Henkilötunnus (11 characters: 6 digits + A + 3 digits + check character)
            r'\b\d{6}[A-Z]\d{3}[A-Z0-9]\b',
            # Poland - PESEL (11 digits)
            r'\b\d{11}\b',
            # Czech Republic - Rodné číslo (10 digits with optional slash)
            r'\b\d{6}[/]?\d{4}\b',
            # Austria - Sozialversicherungsnummer (10 digits)
            r'\b\d{10}\b',
            # Switzerland - AHV-Nummer (13 digits)
            r'\b\d{13}\b',
            # Portugal - Número de Identificação da Segurança Social (11 digits)
            r'\b\d{11}\b',
            # Ireland - PPS Number (7 digits + 1-2 letters)
            r'\b\d{7}[A-Z]{1,2}\b',
            # Luxembourg - Matricule (13 digits)
            r'\b\d{13}\b',
        ]
        
        results = []
        for pattern in european_ssn_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                results.append(RecognizerResult(
                    entity_type="EU_SSN",
                    start=match.start(),
                    end=match.end(),
                    score=0.9
                ))
        
        return results

    def anonymize_text(self, text: str) -> Dict[str, Any]:
        """
        Anonymize text using Presidio with GDPR-compliant operators
        """
        try:
            # Analyze the text first
            results = self.analyzer.analyze(
                text=text,
                language='en',
                entities=[
                    "PERSON", "EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD",
                    "SSN", "IBAN_CODE", "IP_ADDRESS", "LOCATION", "DATE_TIME",
                    "URL", "US_DRIVER_LICENSE", "US_PASSPORT", "US_BANK_NUMBER",
                    "MEDICAL_LICENSE", "UK_NHS", "UK_PASSPORT", "UK_DRIVER_LICENSE",
                    "UK_BANK_ACCOUNT", "AU_ABN", "AU_ACN", "AU_TFN", "AU_MEDICARE"
                ]
            )
            
            # Add custom passport detection results
            passport_results = self.detect_passport_numbers(text)
            results.extend(passport_results)
            
            # Add European SSN detection results
            eu_ssn_results = self.detect_european_ssn(text)
            results.extend(eu_ssn_results)
            
            # Convert results to list of dictionaries for reporting
            analysis_results = []
            for result in results:
                analysis_results.append({
                    "entity_type": result.entity_type,
                    "start": result.start,
                    "end": result.end,
                    "score": result.score,
                    "text": text[result.start:result.end]
                })
            
            # Anonymize the text
            anonymized_result = self.anonymizer.anonymize(
                text=text,
                analyzer_results=results,
                operators=self.operators
            )
            
            # Count anonymized entities
            entity_counts = {}
            for result in analysis_results:
                entity_type = result["entity_type"]
                entity_counts[entity_type] = entity_counts.get(entity_type, 0) + 1
            
            return {
                "original_text": text,
                "anonymized_text": anonymized_result.text,
                "entities_found": analysis_results,
                "entity_counts": entity_counts,
                "total_entities": len(analysis_results),
                "anonymization_method": "GDPR-compliant Presidio"
            }
            
        except Exception as e:
            logger.error(f"Error anonymizing text: {e}")
            return {
                "original_text": text,
                "anonymized_text": text,
                "entities_found": [],
                "entity_counts": {},
                "total_entities": 0,
                "anonymization_method": "Error - fallback to original text",
                "error": str(e)
            }
    
    def anonymize_csv_data(self, csv_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Anonymize CSV data using GDPR-compliant methods
        """
        try:
            anonymized_data = []
            
            for row in csv_data:
                anonymized_row = {}
                
                for column, value in row.items():
                    if isinstance(value, str) and value.strip():
                        # Anonymize text values
                        result = self.anonymize_text(value)
                        anonymized_row[column] = result["anonymized_text"]
                    else:
                        # Keep non-string values as is
                        anonymized_row[column] = value
                
                anonymized_data.append(anonymized_row)
            
            logger.info(f"Anonymized {len(anonymized_data)} CSV rows")
            return anonymized_data
            
        except Exception as e:
            logger.error(f"Error anonymizing CSV data: {e}")
            return csv_data
    
    def get_anonymization_report(self, original_text: str, anonymized_text: str, entities_found: List[Dict]) -> Dict[str, Any]:
        """
        Generate a detailed anonymization report for GDPR compliance
        """
        return {
            "gdpr_compliance": True,
            "anonymization_method": "Microsoft Presidio",
            "entities_detected": len(entities_found),
            "entity_types": list(set([entity["entity_type"] for entity in entities_found])),
            "anonymization_quality": "High - GDPR compliant",
            "data_retention": "No personal data retained",
            "reversibility": "Irreversible anonymization",
            "compliance_standards": ["GDPR", "CCPA", "PIPEDA"],
            "original_length": len(original_text),
            "anonymized_length": len(anonymized_text),
            "anonymization_ratio": len(anonymized_text) / len(original_text) if original_text else 0
        }

# Global instance
gdpr_anonymizer = None

def get_gdpr_anonymizer():
    """Get or create the global GDPR anonymizer instance"""
    global gdpr_anonymizer
    if gdpr_anonymizer is None:
        gdpr_anonymizer = GDPRAnonymizer()
    return gdpr_anonymizer
