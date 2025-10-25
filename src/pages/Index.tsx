import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const subjects = [
  { name: 'Математика', icon: 'Calculator', color: 'bg-blue-100 text-blue-700' },
  { name: 'Физика', icon: 'Atom', color: 'bg-purple-100 text-purple-700' },
  { name: 'Химия', icon: 'Flask', color: 'bg-green-100 text-green-700' },
  { name: 'Биология', icon: 'Dna', color: 'bg-teal-100 text-teal-700' },
  { name: 'История', icon: 'BookOpen', color: 'bg-amber-100 text-amber-700' },
  { name: 'География', icon: 'Globe', color: 'bg-cyan-100 text-cyan-700' },
  { name: 'Литература', icon: 'Book', color: 'bg-rose-100 text-rose-700' },
  { name: 'Английский', icon: 'Languages', color: 'bg-indigo-100 text-indigo-700' },
];

const Index = () => {
  const [question, setQuestion] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Icon name="GraduationCap" size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            ИИ Решатор
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Подробные объяснения по любой теме. Бесплатно навсегда, без регистрации
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Badge variant="secondary" className="text-sm py-1.5 px-4">
              <Icon name="Sparkles" size={14} className="mr-1.5" />
              На базе YAPPERTAR AI
            </Badge>
            <Badge variant="secondary" className="text-sm py-1.5 px-4">
              <Icon name="Zap" size={14} className="mr-1.5" />
              Мгновенные ответы
            </Badge>
          </div>
        </header>

        <div className="max-w-4xl mx-auto mb-16 animate-scale-in">
          <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                <Icon name="MessageSquare" size={28} className="text-blue-600" />
                Решатор задач
              </h2>
              <p className="text-gray-600">Опишите задачу или вопрос, и получите подробное решение</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Ваш вопрос или задача
                </label>
                <Textarea
                  placeholder="Например: Реши уравнение 2x + 5 = 13 и объясни каждый шаг..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[140px] resize-none text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Выберите предмет (опционально)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {subjects.slice(0, 4).map((subject) => (
                    <button
                      key={subject.name}
                      onClick={() => setSelectedSubject(subject.name === selectedSubject ? null : subject.name)}
                      className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        selectedSubject === subject.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${subject.color}`}>
                          <Icon name={subject.icon as any} size={18} />
                        </div>
                        <span className="text-sm font-medium">{subject.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
              >
                <Icon name="Sparkles" size={20} className="mr-2" />
                Получить решение
              </Button>
            </div>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Все предметы</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {subjects.map((subject, index) => (
              <Card 
                key={subject.name}
                className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border-0 bg-white/80 backdrop-blur animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl ${subject.color} flex items-center justify-center mb-4`}>
                  <Icon name={subject.icon as any} size={24} />
                </div>
                <h3 className="font-semibold text-lg">{subject.name}</h3>
              </Card>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Как это работает?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: 'Edit3',
                title: 'Задайте вопрос',
                desc: 'Опишите задачу или тему, которую нужно разобрать'
              },
              {
                icon: 'Brain',
                title: 'ИИ анализирует',
                desc: 'Искусственный интеллект обрабатывает ваш запрос'
              },
              {
                icon: 'FileCheck',
                title: 'Получите ответ',
                desc: 'Подробное решение с объяснением каждого шага'
              }
            ].map((step, index) => (
              <Card 
                key={step.title}
                className="p-6 text-center hover:shadow-lg transition-all border-0 bg-white/80 backdrop-blur animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Icon name={step.icon as any} size={28} className="text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        <footer className="text-center mt-16 pb-8 text-gray-500 text-sm">
          <p>© 2024 ИИ Решатор. Бесплатно навсегда.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
