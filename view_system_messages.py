#!/usr/bin/env python3
"""
Helper script to view system messages from autogen_team_descriptor.json
with proper line breaks instead of \n escape sequences.
"""

import json
import sys

def view_system_messages(json_file="autogen_team_descriptor.json"):
    """Display all system messages with proper formatting."""
    try:
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        participants = data['config']['participants']
        
        for i, participant in enumerate(participants, 1):
            agent_name = participant['config'].get('name', f'Agent {i}')
            system_message = participant['config'].get('system_message', '')
            
            print(f"\n{'='*80}")
            print(f"AGENT: {agent_name}")
            print(f"{'='*80}\n")
            print(system_message)
            print(f"\n{'-'*80}\n")
            
    except FileNotFoundError:
        print(f"Error: {json_file} not found")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON - {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    view_system_messages()

