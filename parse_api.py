import json
import os

try:
    with open('api_response.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("--- Project Level Settings ---")
    for key in data:
        kl = key.lower()
        if any(x in kl for x in ['protection', 'auth', 'sso', 'password']):
            print(f"{key}: {data[key]}")

    if 'latestDeployments' in data:
        print("\n--- Latest Deployment Settings ---")
        for dep in data['latestDeployments']:
            print(f"Deployment ID: {dep['id']} ({dep['target']})")
            for k in dep:
                kl = k.lower()
                if any(x in kl for x in ['protection', 'auth', 'sso', 'password']):
                    print(f"  {k}: {dep[k]}")
except Exception as e:
    print(f"Error parsing: {e}")
