import json
import os
from typing import Dict, Any, Optional

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Решает учебные задачи с помощью OpenAI GPT-4
    Args: event - dict с httpMethod, body (question, subject)
          context - объект с request_id
    Returns: HTTP response с решением задачи
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    try:
        from openai import OpenAI
    except ImportError:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'OpenAI библиотека не установлена'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    question: str = body_data.get('question', '').strip()
    subject: Optional[str] = body_data.get('subject')
    
    if not question:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Вопрос не может быть пустым'}),
            'isBase64Encoded': False
        }
    
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'API ключ OpenAI не настроен'}),
            'isBase64Encoded': False
        }
    
    client = OpenAI(api_key=api_key)
    
    system_prompt = """Ты - опытный преподаватель и репетитор. Твоя задача - помогать ученикам решать задачи и объяснять темы максимально понятно.

Правила:
- Всегда давай подробные пошаговые объяснения
- Используй простой язык, понятный школьникам
- Если это задача - покажи каждый шаг решения
- Если это теория - объясни простыми словами с примерами
- Форматируй ответ в markdown для удобства чтения
- Будь дружелюбным и поддерживающим"""

    if subject:
        system_prompt += f"\n\nПредмет: {subject}"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": question}
    ]
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.7,
        max_tokens=2000
    )
    
    solution = response.choices[0].message.content
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'solution': solution,
            'subject': subject,
            'request_id': context.request_id
        }, ensure_ascii=False),
        'isBase64Encoded': False
    }
