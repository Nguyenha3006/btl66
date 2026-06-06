import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, BookOpen, Trash2, Edit2, 
  Play, RefreshCw, AlertCircle, HelpCircle, FileText, Upload 
} from 'lucide-react';
import { Deck, Card } from '../types';

interface DeckDetailProps {
  token: string;
  deck: Deck;
  onBack: () => void;
  onStartStudy: (cardsToStudy: Card[]) => void;
}

export default function DeckDetail({ token, deck, onBack, onStartStudy }: DeckDetailProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add / Edit Card form
  const [showCardForm, setShowCardForm] = useState(false);
  const [isEditingCard, setIsEditingCard] = useState<Card | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [cardSubmitting, setCardSubmitting] = useState(false);

  // Bulk Import state
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);
  const [csvFileContent, setCsvFileContent] = useState('');
  const [csvFileName, setCsvFileName] = useState('');



  const fetchCards = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/decks/${deck._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Không thể tải các thẻ ghi nhớ.');
      const data = await res.json();
      setCards(data.cards || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải thẻ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [deck, token]);

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setCardSubmitting(true);
    const url = isEditingCard ? `/api/decks/cards/${isEditingCard._id}` : '/api/decks/cards';
    const method = isEditingCard ? 'PUT' : 'POST';
    const payload = isEditingCard 
      ? { question, answer } 
      : { deckId: deck._id, question, answer };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Không thể tạo thẻ.');

      // Clear Card Form state
      setQuestion('');
      setAnswer('');
      setIsEditingCard(null);
      setShowCardForm(false);
      fetchCards();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCardSubmitting(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Bạn có chắc muốn xóa thẻ ghi nhớ này? Hành động này không thể hoàn tác.')) return;

    try {
      const res = await fetch(`/api/decks/cards/${cardId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Không thể xóa thẻ.');
      fetchCards();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleImportBulkText = async () => {
    if (!bulkText.trim()) return;

    setBulkImporting(true);
    try {
      const lines = bulkText.split('\n');
      const cardsToImport: Array<{ question: string; answer: string }> = [];

      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split('|');
        if (parts.length >= 2) {
          cardsToImport.push({
            question: parts[0].trim(),
            answer: parts[1].trim()
          });
        }
      }

      if (cardsToImport.length === 0) {
        throw new Error('Không tìm thấy thẻ ghi nhớ hợp lệ. Vui lòng kiểm tra lại định dạng phân tách bằng dấu "|".');
      }

      const res = await fetch(`/api/decks/${deck._id}/import-cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cards: cardsToImport })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi nhập thẻ.');

      alert(data.message);
      setBulkText('');
      setShowBulkImport(false);
      fetchCards();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBulkImporting(false);
    }
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === 'string') {
        setCsvFileContent(text);
      }
    };
    reader.readAsText(file);
  };

  const handleImportCsvFile = async () => {
    if (!csvFileContent) return;

    setBulkImporting(true);
    try {
      const lines = csvFileContent.split('\n');
      const cardsToImport: Array<{ question: string; answer: string }> = [];

      for (const line of lines) {
        if (!line.trim()) continue;
        let delimiter = ',';
        if (line.includes(';')) {
          delimiter = ';';
        }
        
        const parts = line.split(delimiter);
        if (parts.length >= 2) {
          cardsToImport.push({
            question: parts[0].trim().replace(/^["']|["']$/g, ''),
            answer: parts[1].trim().replace(/^["']|["']$/g, '')
          });
        }
      }

      if (cardsToImport.length === 0) {
        throw new Error('Tệp tin CSV trống hoặc sai định dạng.');
      }

      const res = await fetch(`/api/decks/${deck._id}/import-cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cards: cardsToImport })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi nhập thẻ từ CSV.');

      alert(data.message);
      setCsvFileContent('');
      setCsvFileName('');
      setShowBulkImport(false);
      fetchCards();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBulkImporting(false);
    }
  };



  // Filter cards due for study session
  const now = new Date();
  const dueCards = cards.filter(c => new Date(c.nextReview) <= now);

  return (
    <div id="deck-detail-wrapper" className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-16">
      
      {/* Detail Header area */}
      <div id="detail-top-banner" className="bg-white border-b border-slate-200 px-6 py-6 font-sans">
        <div className="max-w-6xl mx-auto">
          <button
            id="btn-back-dashboard"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#CC0000] font-bold transition-all cursor-pointer mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Dashboard</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-800">{deck.name}</h2>
                <span className="text-xs bg-slate-100 border border-slate-200 text-slate-800 px-2.5 py-0.5 rounded font-bold">
                  {cards.length} thẻ ghi nhớ
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-2xl">
                {deck.description || 'Chưa cấu hình nội dung mô tả cho bộ thẻ học tập này.'}
              </p>
            </div>

            {/* Launch Study button */}
            <div className="flex items-center gap-3 shrink-0">
              {dueCards.length > 0 ? (
                <button
                  id="btn-start-study-due"
                  onClick={() => onStartStudy(dueCards)}
                  className="bg-[#CC0000] hover:bg-red-850 text-white px-5 py-3 rounded flex items-center gap-2 font-bold text-sm tracking-wide cursor-pointer transition-all shadow-md animate-pulse"
                >
                  <Play className="w-4.5 h-4.5 fill-current" />
                  <span>ÔN TẬP NGAY ({dueCards.length} Thẻ Quá Hạn)</span>
                </button>
              ) : (
                <button
                  id="btn-start-study-all"
                  onClick={() => onStartStudy(cards)}
                  disabled={cards.length === 0}
                  className="bg-slate-900 hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded flex items-center gap-2 font-bold text-sm tracking-wide cursor-pointer transition-all shadow-sm"
                >
                  <Play className="w-4.5 h-4.5" />
                  <span>Ôn tập toàn bộ bộ thẻ ({cards.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-6">
        
        {/* Action controls index */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => {
              setIsEditingCard(null);
              setQuestion('');
              setAnswer('');
              setShowCardForm(prev => !prev);
              setShowBulkImport(false);
            }}
            className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 text-slate-800 p-2.5 rounded border border-slate-200">
                <Plus className="w-5 h-5 text-[#CC0000]" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm text-slate-800">Thêm thẻ ghi nhớ thủ công</h4>
                <p className="text-xs text-slate-500">Bạn tự nhập câu hỏi, định nghĩa tương ứng</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setShowBulkImport(prev => !prev);
              setShowCardForm(false);
            }}
            className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-white p-2.5 rounded text-amber-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm text-slate-800">Nhập thẻ hàng loạt (CSV / Text)</h4>
                <p className="text-xs text-slate-500">Tải tệp CSV hoặc dán văn bản phân tách bằng ký tự |</p>
              </div>
            </div>
          </button>
        </section>

        {/* Dynamic Input/AI Forms */}
        {showCardForm && (
          <div className="bg-white border border-slate-200 p-6 rounded-xl mb-6 shadow-sm animate-slide-up">
            <h4 className="font-bold text-sm text-slate-850 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <BookOpen className="w-5 h-5 text-[#CC0000]" />
              <span>{isEditingCard ? 'Cập nhật thẻ Flashcard' : 'Tạo thêm thẻ Flashcard mới'}</span>
            </h4>

            <form onSubmit={handleSaveCard} className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mặt trước - Câu hỏi / Thuật ngữ</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Điền từ khóa chính hoặc câu hỏi của bạn..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#CC0000] focus:border-[#CC0000] bg-white text-slate-900 resize-none font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mặt sau - Đáp án / Định nghĩa</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Giải đáp khoa học của câu hỏi ở trên..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#CC0000] focus:border-[#CC0000] bg-white text-slate-900 resize-none font-sans"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCardForm(false)}
                  className="text-xs text-slate-400 font-bold px-4 py-2 hover:bg-slate-100 rounded transition-all cursor-pointer"
                >
                  Đóng Form
                </button>
                <button
                  type="submit"
                  disabled={cardSubmitting}
                  className="text-xs bg-slate-900 hover:bg-slate-850 text-white px-5 py-2 rounded font-bold flex items-center gap-1 cursor-pointer"
                >
                  {cardSubmitting ? 'Đang viết...' : 'Xác nhận Lưu'}
                </button>
              </div>
            </form>
          </div>
        )}

        {showBulkImport && (
          <div className="bg-white border border-slate-200 p-6 rounded-xl mb-6 shadow-sm animate-slide-up text-slate-900">
            <h4 className="font-bold text-sm text-slate-850 uppercase tracking-widest mb-1 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Upload className="w-5 h-5 text-amber-500" />
              <span>Nhập thẻ ghi nhớ hàng loạt (Bulk Import)</span>
            </h4>
            <p className="text-xs text-slate-500 mb-4">Chọn dán nội dung văn bản trực tiếp hoặc tải tệp tin CSV lên để tự động import hàng loạt thẻ nhanh chóng.</p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Option A: Paste Text */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Cách 1: Dán văn bản phân tách bằng "|"</h5>
                <p className="text-[10px] text-slate-400">Định dạng mẫu: Câu hỏi | Câu trả lời (Mỗi dòng một thẻ)</p>
                <textarea
                  rows={6}
                  placeholder="Ví dụ:&#10;Đại học Bách khoa Hà Nội thành lập năm nào? | Năm 1956&#10;Thuật toán SM-2 dùng để làm gì? | Lặp lại ngắt quãng"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="border border-slate-200 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#CC0000] focus:border-[#CC0000] bg-white text-slate-900 resize-none font-sans"
                />
                <button
                  onClick={handleImportBulkText}
                  disabled={bulkImporting || !bulkText.trim()}
                  className="mt-auto text-xs bg-slate-900 hover:bg-slate-850 text-white py-2.5 rounded font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {bulkImporting ? 'Đang tải lên...' : 'Xác nhận nhập bằng văn bản'}
                </button>
              </div>

              {/* Option B: Upload CSV File */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3">
                <div>
                  <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-1">Cách 2: Tải lên tệp tin CSV</h5>
                  <p className="text-[10px] text-slate-450 leading-relaxed">
                    Tải lên file định dạng CSV (`.csv`). <br />
                    - Dùng dấu phẩy `,` hoặc dấu chấm phẩy `;` làm phân tách.<br />
                    - Cột đầu tiên là Câu hỏi, Cột thứ hai là Câu trả lời.<br />
                    - Không cần dòng tiêu đề (header).
                  </p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCsvFileChange}
                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
                  />
                  {csvFileContent && (
                    <p className="text-[10px] text-green-600 font-semibold mt-1">
                      Đã nhận file: {csvFileName} ({csvFileContent.split('\n').filter(l => l.trim()).length} thẻ)
                    </p>
                  )}
                </div>

                <button
                  onClick={handleImportCsvFile}
                  disabled={bulkImporting || !csvFileContent}
                  className="text-xs bg-[#CC0000] hover:bg-red-850 text-white py-2.5 rounded font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {bulkImporting ? 'Đang import...' : 'Xác nhận tải file CSV'}
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBulkImport(false)}
                className="text-xs text-slate-400 font-bold px-4 py-2 hover:bg-slate-100 rounded transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}



      {/* Cards list summary */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-5 h-5 text-slate-500" />
            <span>Thống kê danh sách thẻ Flashcard</span>
          </h3>

          {loading ? (
            <div className="py-16 text-center text-sm text-slate-500 bg-white border border-slate-200 rounded-xl">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-400 mb-2" />
              <span>Đang kết nối kho dữ liệu thẻ...</span>
            </div>
          ) : cards.length === 0 ? (
            <div className="bg-white border border-slate-200 p-12 rounded-xl text-center shadow-xs">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">Chưa có Flashcard nào</h4>
              <p className="text-xs text-slate-500 mt-1.5">Hãy chọn nhập thủ công để tạo thẻ ghi nhớ ôn học nhé!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map(card => {
                const isDue = new Date(card.nextReview) <= now;
                return (
                  <div
                    key={card._id}
                    className="bg-white border border-slate-200 hover:border-[#CC0000]/60 p-5 rounded-xl transition-all shadow-sm hover:shadow-md flex justify-between gap-4"
                  >
                    <div className="flex-grow flex flex-col gap-2.5">
                      <div className="flex items-center gap-2">
                        {isDue ? (
                          <span className="text-[10px] bg-red-50 text-[#CC0000] border border-red-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-0.5">
                            🔥 Quá hạn ôn
                          </span>
                        ) : (
                          <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            Đã ghi nhớ
                          </span>
                        )}

                        <span className="text-[9px] text-slate-400 font-mono">
                          SM Factor: {card.efactor} • Reps: {card.repetition}
                        </span>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mặt câu hỏi:</p>
                        <p className="text-sm font-bold text-slate-850 mt-1 line-clamp-2">{card.question}</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đáp án tóm gọn:</p>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{card.answer}</p>
                      </div>

                      <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-100 flex items-center gap-1 mt-auto">
                        <span>Lịch ôn lần sau:</span>
                        <strong className="text-slate-750">
                          {new Date(card.nextReview).toLocaleDateString('vi-VN')} - {new Date(card.nextReview).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </strong>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 border-l border-slate-100 pl-3 shrink-0 justify-center">
                      <button
                        onClick={() => {
                          setIsEditingCard(card);
                          setQuestion(card.question);
                          setAnswer(card.answer);
                          setShowCardForm(true);
                          // scroll to form
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="p-1 px-1.5 text-slate-400 hover:text-[#CC0000] hover:bg-slate-100 rounded transition-all"
                        title="Sửa thẻ ghi nhớ"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card._id)}
                        className="p-1 px-1.5 text-slate-400 hover:text-[#CC0000] hover:bg-red-50 rounded transition-all"
                        title="Xóa thẻ ghi nhớ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

    </div>
  );
}
