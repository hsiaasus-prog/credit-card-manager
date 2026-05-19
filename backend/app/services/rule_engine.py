from typing import List, Dict
from ..models.models import Rule, Transaction

class RuleEngine:
    def calculate_cashback(self, transaction: Transaction, rules: List[Rule]) -> float:
        """
        Calculate cashback for a given transaction based on card rules.
        """
        max_cashback = 0.0
        
        for rule in rules:
            rate = rule.rate
            rule_logic = rule.rule_json # e.g., {"categories": ["食"], "keywords": ["蝦皮"], "is_online": True}
            
            # Simple matching logic
            match = False
            
            # Match by category
            if "categories" in rule_logic and transaction.category in rule_logic["categories"]:
                match = True
            
            # Match by keyword in clean_name or raw_name
            if "keywords" in rule_logic:
                for kw in rule_logic["keywords"]:
                    if kw.lower() in (transaction.clean_name or "").lower() or kw.lower() in transaction.raw_name.lower():
                        match = True
                        break
            
            # Match by online status (placeholder, transaction needs is_online field or derived)
            if "is_online" in rule_logic and rule_logic["is_online"]:
                # For now, let's assume if category is "網購", it matches is_online
                if transaction.category == "網購":
                    match = True

            if match:
                cashback = transaction.amount * rate
                # Handle cap (if implemented as monthly cap, needs more complex logic)
                # For now, just per-transaction logic if cap is specified
                if rule.cap is not None:
                    cashback = min(cashback, rule.cap)
                
                max_cashback = max(max_cashback, cashback)
        
        # If no specific rules match, return 0 or a base rate if implemented
        return max_cashback

    def suggest_best_card(self, merchant_name: str, cards_with_rules: List[Dict]) -> Dict:
        """
        Given a merchant name and a list of cards with their rules, suggest the best card.
        cards_with_rules: List of {"card": Card, "rules": List[Rule]}
        """
        best_card = None
        highest_rate = -1.0
        
        for item in cards_with_rules:
            card = item["card"]
            rules = item["rules"]
            
            # Find the best rule for this merchant on this card
            card_best_rate = 0.0
            for rule in rules:
                rule_logic = rule.rule_json
                match = False
                
                if "keywords" in rule_logic:
                    for kw in rule_logic["keywords"]:
                        if kw.lower() in merchant_name.lower():
                            match = True
                            break
                
                if match:
                    card_best_rate = max(card_best_rate, rule.rate)
            
            if card_best_rate > highest_rate:
                highest_rate = card_best_rate
                best_card = card
        
        return {
            "best_card": best_card.card_name if best_card else "None",
            "bank_name": best_card.bank_name if best_card else "None",
            "estimated_rate": highest_rate if highest_rate >= 0 else 0.0
        }
