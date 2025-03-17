document.addEventListener('DOMContentLoaded', function () {
  const ctx = document.getElementById('opinionChart').getContext('2d');

  // 初期データ：各評価項目を0で初期化
  let opinionChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['ストーリー', 'キャラクター', '読みやすさ', '絵の上手さ', 'センス'],
      datasets: [{
        label: '評価',
        data: [0, 0, 0, 0, 0],
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        borderColor: '#007BFF',
        borderWidth: 2,
        pointBackgroundColor: '#007BFF'
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });

  // 検索フォーム送信時の処理
  document.getElementById('mangaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('mangaTitle').value.trim();
    if (!title) {
      alert("漫画のタイトルを入力してください");
      return;
    }
    console.log("検索中のタイトル:", title);

    fetch('/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("サーバーエラーが発生しました (" + response.status + ")");
      }
      return response.json();
    })
    .then(data => {
      console.log("サーバーから受信したデータ:", data);
      if (data.scores && Array.isArray(data.scores) && data.scores.length === 5) {
        opinionChart.data.datasets[0].data = data.scores;
        opinionChart.update();
      } else {
        alert("スコアデータの形式が正しくありません");
      }
      if (data.totalScore !== undefined) {
        document.getElementById('score').textContent = data.totalScore.toFixed(1);
      }
    })
    .catch(error => {
      console.error("エラー:", error);
      alert("データ取得中にエラーが発生しました: " + error.message);
    });
  });
});
