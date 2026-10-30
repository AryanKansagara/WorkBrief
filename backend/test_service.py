import io
import json
import os
import unittest
from unittest.mock import patch
from service import generate, validate_notes, validate_result, call_provider, SYSTEM
from evaluate import evaluate

GOOD={'summary':'Reviewed scope.','actions':[{'owner':'Maya','task':'Review notes.'}],'risks':[]}
class Tests(unittest.TestCase):
    def test_blank(self):
        with self.assertRaises(ValueError):validate_notes(' ')
    def test_type(self):
        with self.assertRaises(ValueError):validate_notes(None)
    def test_limit(self):
        with self.assertRaises(ValueError):validate_notes('x'*6001)
    def test_exact_limit(self):self.assertEqual(len(validate_notes('x'*6000)),6000)
    def test_extract(self):self.assertEqual(generate('Action: Maya | Review notes.','offline')['actions'],GOOD['actions'])
    def test_risk(self):self.assertEqual(generate('Risk: Missing scope.','offline')['risks'],['Missing scope.'])
    def test_no_invented_action(self):self.assertEqual(generate('Discuss options.','offline')['actions'],[])
    def test_unknown_mode(self):
        with self.assertRaises(ValueError):generate('Notes','unknown')
    def test_offline_source(self):self.assertEqual(generate('Notes','offline')['source'],'offline-extractive')
    def test_metadata(self):self.assertEqual(generate('Notes','offline')['prompt_version'],'brief-v1')
    def test_missing_fields(self):
        with self.assertRaises(ValueError):validate_result({'summary':'x'})
    def test_extra_fields(self):
        with self.assertRaises(ValueError):validate_result({**GOOD,'command':'delete'})
    def test_bad_action(self):
        with self.assertRaises(ValueError):validate_result({**GOOD,'actions':[{'owner':'Maya'}]})
    def test_blank_owner(self):
        with self.assertRaises(ValueError):validate_result({**GOOD,'actions':[{'owner':'','task':'Task'}]})
    def test_bad_risk(self):
        with self.assertRaises(ValueError):validate_result({**GOOD,'risks':[42]})
    def test_too_many_actions(self):
        with self.assertRaises(ValueError):validate_result({**GOOD,'actions':GOOD['actions']*31})
    def test_long_summary(self):
        with self.assertRaises(ValueError):validate_result({**GOOD,'summary':'x'*2001})
    def test_https_configuration(self):
        with patch.dict(os.environ,{'LLM_CHAT_URL':'http://example.invalid'}):
            with self.assertRaises(ValueError):call_provider('notes')
    def test_provider_contract(self):
        raw=json.dumps({'choices':[{'message':{'content':json.dumps(GOOD)}}]}).encode()
        with patch.dict(os.environ,{'LLM_CHAT_URL':'https://example.invalid/chat','LLM_MODEL':'test','LLM_API_KEY':'fixture-only'}),patch('urllib.request.urlopen',return_value=io.BytesIO(raw)) as mock:
            r=generate('source text','llm')
            self.assertEqual(r['source'],'configured-llm')
            request=mock.call_args.args[0]
            payload=json.loads(request.data)
            self.assertEqual(payload['messages'][0]['content'],SYSTEM)
            self.assertEqual(json.loads(payload['messages'][1]['content']),{'notes':'source text'})
    def test_provider_schema_rejected(self):
        with patch('service.call_provider',return_value={'text':'not schema'}):
            with self.assertRaises(ValueError):generate('notes','llm')
    def test_provider_failure_not_silent_fallback(self):
        with patch('service.call_provider',side_effect=TimeoutError):
            with self.assertRaises(TimeoutError):generate('notes','llm')
    def test_benchmark(self):
        result=evaluate()
        self.assertEqual(result['synthetic_cases'],6)
        self.assertEqual(result['action_exact_match'],1)
        self.assertEqual(result['risk_exact_match'],1)

if __name__=='__main__':unittest.main()
