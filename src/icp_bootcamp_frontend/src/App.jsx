import { useEffect, useState } from 'react';
import { icp_bootcamp_backend } from 'declarations/icp_bootcamp_backend';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState([]);
  const [voterName, setVoterName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Ambil data kandidat dan vote
        const c = await icp_bootcamp_backend.getCandidates();
        const v = await icp_bootcamp_backend.getVotes();
        setCandidates(c);
        setVotes(v);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage("Gagal memuat data");
      }
    }
    fetchData();
  }, []);

  async function checkVoterStatus() {
    if (!voterName.trim()) return;

    try {
      const status = await icp_bootcamp_backend.checkVoterStatus(voterName);
      setHasVoted(status);

      if (status) {
        fetchResults();
      }
    } catch (error) {
      console.error("Error checking voter status:", error);
    }
  }

  async function fetchResults() {
    try {
      const res = await icp_bootcamp_backend.getResults();
      setResults(res);
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  }

  async function vote(index) {
    if (!voterName.trim()) {
      setMessage("Silakan masukkan nama Anda terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const result = await icp_bootcamp_backend.vote(index, voterName);
      setMessage(result);

      if (!result.includes("sudah melakukan pemilihan")) {
        setHasVoted(true);
        fetchResults();
      }

      const updatedVotes = await icp_bootcamp_backend.getVotes();
      setVotes(updatedVotes);
    } catch (error) {
      console.error("Error voting:", error);
      setMessage("Terjadi kesalahan saat memilih");
    } finally {
      setLoading(false);
    }
  }

  // Handler saat nama berubah
  const handleNameChange = (e) => {
    const name = e.target.value;
    setVoterName(name);
    setHasVoted(false);
    setShowResults(false);
  };

  // Handler saat form nama disubmit
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!voterName.trim()) return;

    await checkVoterStatus();
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">🗳 Sistem Pemilihan Sederhana</h1>

        {/* Form Nama */}
        <form onSubmit={handleNameSubmit} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Anda:
          </label>
          <div className="flex">
            <input
              type="text"
              className="flex-1 border rounded-l p-2"
              value={voterName}
              onChange={handleNameChange}
              placeholder="Masukkan nama Anda"
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-gray-200 px-3 rounded-r border-t border-r border-b hover:bg-gray-300"
              disabled={!voterName.trim() || loading}
            >
              Cek
            </button>
          </div>
        </form>

        {/* Hanya tampilkan kandidat jika user belum voting */}
        {voterName && !hasVoted && (
          <div className="space-y-3 mt-4">
            <p className="font-medium">Pilih salah satu kandidat:</p>
            {candidates.map((name, index) => (
              <div
                key={index}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                <div className="font-medium">{name}</div>
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                  onClick={() => vote(index)}
                  disabled={loading || !voterName.trim()}
                >
                  Pilih
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pesan jika user sudah voting */}
        {hasVoted && (
          <div className="text-center mb-4">
            <p className="text-green-600 font-medium mb-4">
              Terima kasih <strong>{voterName}</strong>, Anda telah berpartisipasi dalam pemilihan!
            </p>
          </div>
        )}

        {/* Hasil pemilihan */}
        {showResults && (
          <div className="mt-6 pt-6 border-t">
            <h2 className="text-xl font-bold mb-3">Hasil Pemilihan:</h2>
            <div className="space-y-2">
              {results.map((item, index) => (
                <div key={index} className="flex justify-between border-b pb-2">
                  <span>{item.candidate}</span>
                  <span className="font-bold">{item.voteCount} suara</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pesan feedback */}
        {message && (
          <div className="mt-4 text-center text-blue-600 font-medium">{message}</div>
        )}
      </div>
    </main>
  );
}

export default App;