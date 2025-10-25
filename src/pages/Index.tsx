import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

const subjects = [
  { name: 'Математика', icon: 'Calculator', color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
  { name: 'Физика', icon: 'Atom', color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
  { name: 'Химия', icon: 'Flask', color: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' },
  { name: 'Биология', icon: 'Dna', color: 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400' },
  { name: 'История', icon: 'BookOpen', color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
  { name: 'География', icon: 'Globe', color: 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400' },
  { name: 'Литература', icon: 'Book', color: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' },
  { name: 'Английский', icon: 'Languages', color: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' },
];

interface HistoryTask {
  id: number;
  question: string;
  subject: string | null;
  solution: string;
  created_at: string;
}

const Index = () => {
  const [question, setQuestion] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryTask[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [userSession, setUserSession] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    let session = localStorage.getItem('user_session');
    if (!session) {
      session = 'user_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('user_session', session);
    }
    setUserSession(session);
    loadHistory(session);
    
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkModeQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    darkModeQuery.addEventListener('change', handleChange);
    return () => darkModeQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const loadHistory = async (session: string) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/6afd1d6e-6063-4f41-bf45-f54dd82c4d17?user_session=${session}&limit=20`);
      const data = await response.json();
      if (response.ok) {
        setHistory(data.tasks || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    }
  };

  const handleSolve = async () => {
    if (!question.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, введите вопрос или задачу',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    setSolution(null);

    try {
      const response = await fetch('https://functions.poehali.dev/d5bc93f7-41f1-44ce-a885-40e0c7e608c0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: question,
          subject: selectedSubject,
          user_session: userSession
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при получении решения');
      }

      setSolution(data.solution);
      loadHistory(userSession);
      toast({
        title: 'Готово!',
        description: 'Решение получено'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось получить решение',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-900 dark:via-blue-950/30 dark:to-gray-900 transition-colors duration-500">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="fixed top-6 right-6 z-50 flex gap-2">
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="outline"
            size="icon"
            className="rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
          >
            <Icon name="History" size={20} />
          </Button>
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="icon"
            className="rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
          >
            <Icon name={isDark ? 'Sun' : 'Moon'} size={20} />
          </Button>
        </div>

        <header className="text-center mb-16 animate-fade-in-up">
          <div className="inline-block mb-6 animate-glow">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl animate-float">
              <Icon name="GraduationCap" size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent animate-fade-in">
            ИИ Решатор
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
            Подробные объяснения по любой теме. Бесплатно навсегда, без регистрации
          </p>
          <div className="flex gap-3 justify-center mt-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Badge variant="secondary" className="text-sm py-1.5 px-4 hover:scale-105 transition-transform duration-300">
              <Icon name="Sparkles" size={14} className="mr-1.5" />
              На базе YAPPERTAR AI
            </Badge>
            <Badge variant="secondary" className="text-sm py-1.5 px-4 hover:scale-105 transition-transform duration-300">
              <Icon name="Zap" size={14} className="mr-1.5" />
              Мгновенные ответы
            </Badge>
          </div>
        </header>

        <div className="max-w-4xl mx-auto mb-16 animate-scale-in" style={{ animationDelay: '300ms' }}>
          <Card className="p-8 shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/40 transition-all duration-500">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2 dark:text-white">
                <Icon name="MessageSquare" size={28} className="text-blue-600 dark:text-blue-400" />
                Решатор задач
              </h2>
              <p className="text-gray-600 dark:text-gray-300">Опишите задачу или вопрос, и получите подробное решение</p>
            </div>
            
            <div className="space-y-4">
              <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                  Ваш вопрос или задача
                </label>
                <Textarea
                  placeholder="Например: Реши уравнение 2x + 5 = 13 и объясни каждый шаг..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[140px] resize-none text-base transition-all duration-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                />
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
                <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-200">
                  Выберите предмет (опционально)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {subjects.slice(0, 4).map((subject, index) => (
                    <button
                      key={subject.name}
                      onClick={() => setSelectedSubject(subject.name === selectedSubject ? null : subject.name)}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                        selectedSubject === subject.name
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-blue-500/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                      style={{ animationDelay: `${600 + index * 50}ms` }}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${subject.color} transition-all duration-300`}>
                          <Icon name={subject.icon as any} size={18} />
                        </div>
                        <span className="text-sm font-medium dark:text-white">{subject.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                size="lg"
                onClick={handleSolve}
                disabled={isLoading}
                className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 shadow-lg hover:shadow-blue-500/50 hover:scale-[1.02] transition-all duration-300 animate-fade-in disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ animationDelay: '800ms' }}
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Думаю...
                  </>
                ) : (
                  <>
                    <Icon name="Sparkles" size={20} className="mr-2" />
                    Получить решение
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {solution && (
          <div className="max-w-4xl mx-auto mb-16 animate-scale-in">
            <Card className="p-8 shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold flex items-center gap-2 dark:text-white">
                  <Icon name="CheckCircle2" size={28} className="text-green-600 dark:text-green-400" />
                  Решение
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSolution(null)}
                  className="hover:bg-red-100 dark:hover:bg-red-900/20"
                >
                  <Icon name="X" size={18} />
                </Button>
              </div>
              <div className="prose prose-blue dark:prose-invert max-w-none">
                <ReactMarkdown className="text-gray-700 dark:text-gray-200 leading-relaxed">
                  {solution}
                </ReactMarkdown>
              </div>
              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSolution(null);
                    setQuestion('');
                    setSelectedSubject(null);
                  }}
                  className="flex-1"
                >
                  <Icon name="RefreshCw" size={18} className="mr-2" />
                  Новый вопрос
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(solution);
                    toast({ title: 'Скопировано!', description: 'Решение скопировано в буфер обмена' });
                  }}
                  className="flex-1"
                >
                  <Icon name="Copy" size={18} className="mr-2" />
                  Копировать
                </Button>
              </div>
            </Card>
          </div>
        )}

        {showHistory && (
          <div className="max-w-4xl mx-auto mb-16 animate-scale-in">
            <Card className="p-8 shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold flex items-center gap-2 dark:text-white">
                  <Icon name="History" size={28} className="text-blue-600 dark:text-blue-400" />
                  История решений
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                  className="hover:bg-red-100 dark:hover:bg-red-900/20"
                >
                  <Icon name="X" size={18} />
                </Button>
              </div>
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Icon name="FileQuestion" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>История пока пуста. Решите первую задачу!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {history.map((task) => (
                    <Card
                      key={task.id}
                      className="p-4 hover:shadow-lg transition-all cursor-pointer border dark:border-gray-700"
                      onClick={() => {
                        setQuestion(task.question);
                        setSelectedSubject(task.subject);
                        setSolution(task.solution);
                        setShowHistory(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Icon name="MessageSquare" size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {task.subject && (
                            <Badge variant="secondary" className="mb-2">
                              {task.subject}
                            </Badge>
                          )}
                          <p className="text-sm font-medium dark:text-white line-clamp-2">
                            {task.question}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(task.created_at).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Icon name="ChevronRight" size={18} className="text-gray-400 flex-shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 dark:text-white animate-fade-in">Все предметы</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {subjects.map((subject, index) => (
              <Card 
                key={subject.name}
                className="p-6 hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/40 transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl group animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl ${subject.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon name={subject.icon as any} size={24} />
                </div>
                <h3 className="font-semibold text-lg dark:text-white">{subject.name}</h3>
              </Card>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 dark:text-white animate-fade-in">Как это работает?</h2>
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
                className="p-6 text-center hover:shadow-2xl hover:shadow-cyan-500/20 dark:hover:shadow-cyan-500/40 transition-all duration-500 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl group hover:-translate-y-2 animate-scale-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Icon name={step.icon as any} size={28} className="text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        <footer className="text-center mt-16 pb-8 text-gray-500 dark:text-gray-400 text-sm animate-fade-in">
          <p>© 2024 ИИ Решатор. Бесплатно навсегда.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;