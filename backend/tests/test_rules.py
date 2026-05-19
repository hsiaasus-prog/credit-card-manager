import unittest
from app.models.models import Transaction, Rule
from app.services.rule_engine import RuleEngine
from datetime import date

class TestRuleEngine(unittest.TestCase):
    def setUp(self):
        self.engine = RuleEngine()

    def test_cashback_by_category(self):
        # Transaction in '食' category
        trans = Transaction(amount=1000.0, category="食", raw_name="Test Restaurant", trans_date=date.today())
        # Rule for 5% cashback on '食'
        rule = Rule(rate=0.05, rule_json={"categories": ["食"]}, name="Foodie Rule")
        
        result = self.engine.calculate_cashback(trans, [rule])
        self.assertEqual(result, 50.0)

    def test_cashback_by_keyword(self):
        # Transaction with keyword 'Shopee'
        trans = Transaction(amount=2000.0, category="Shopping", raw_name="SHOPEE TW", clean_name="蝦皮購物", trans_date=date.today())
        # Rule for 3% cashback on '蝦皮'
        rule = Rule(rate=0.03, rule_json={"keywords": ["蝦皮"]}, name="Shopee Rule")
        
        result = self.engine.calculate_cashback(trans, [rule])
        self.assertEqual(result, 60.0)

    def test_cashback_with_cap(self):
        # Large transaction
        trans = Transaction(amount=10000.0, category="Travel", raw_name="Hotel", trans_date=date.today())
        # Rule for 10% cashback but capped at $500
        rule = Rule(rate=0.1, cap=500.0, rule_json={"categories": ["Travel"]}, name="Travel Rule")
        
        result = self.engine.calculate_cashback(trans, [rule])
        self.assertEqual(result, 500.0)

if __name__ == "__main__":
    unittest.main()
