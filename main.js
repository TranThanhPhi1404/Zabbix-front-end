// Phần kết nối với web trong firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js"; 
import { getDatabase, ref, child, get  , onValue} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js"; 
const firebaseConfig = { 
    apiKey: "AIzaSyDtbRGQKI74nw44DjpCUjHCu47wcmTi7sU",
    authDomain: "zabbix-7bf0d.firebaseapp.com", 
    databaseURL: "https://zabbix-7bf0d-default-rtdb.firebaseio.com/", 
    projectId: "zabbix-7bf0d", 
    storageBucket: "zabbix-7bf0d.appspot.com", 
    messagingSenderId: "545016245770", 
    appId: "1:545016245770:web:3617fa5bfe9a80ff01f9f3",
    measurementId: "G-2YYWKHK7LR" 
}; 
const app = initializeApp(firebaseConfig); 
const db = getDatabase(app); 
console.log("Firebase kết nối thành công");


//Vẽ biểu đồ
function drawChart(ctx, labels, data, label ,  predictionData = []) {
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(t => new Date(t * 1000).toLocaleString()), // Chuyển đổi timestamp
            datasets: [
                {
                    label: label,
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false
                },
                
                
        ].filter(Boolean)
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: label
                    }
                }
            }
        }
    });
}

// Lắng nghe sự kiện thay đổi dữ liệu
function listenForDataChanges(hostId) {
    const dbRef = ref(db, hostId); // Đường dẫn tới các mục
    onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
            const allData = snapshot.val(); // Lấy giá trị dữ liệu
            console.log("Dữ liệu mới:", hostId, ":", allData);
            renderCharts(allData); // Cập nhật biểu đồ với dữ liệu mới
        } else {
            console.log("Không có dữ liệu" , hostId);
        }
    }, (error) => {
        console.error("Lỗi khi lắng nghe dữ liệu:", error);
    });
}


let currentChartData = [];
let cpuAvgChart, cpuUserChart, memoryChart, diskChart, networkChart;
async function renderCharts(allData) {
    
    
    
    if (allData) {
        // Biểu đồ CPU Average
        const cpuAvgData = allData.Cpu_Avg;
        const cpuAvgTimestamps = Object.values(cpuAvgData).map(item =>item.timestamp);
        const cpuAvgValues = Object.values(cpuAvgData).map(item => parseFloat(item.data[0].lastvalue));
        
        currentChartData = cpuAvgTimestamps.map((timestamp, index) => ({
            key: timestamp, 
            value: cpuAvgValues[index] 
        }));

        const cpuAvgCtx = document.getElementById('cpu_avg_chart').getContext('2d');
        // const predictionData = await getPredictionData(24, cpuAvgValues);
        if (cpuAvgChart) {
            cpuAvgChart.destroy();
            cpuAvgChart = null;
        }
        cpuAvgChart = drawChart(cpuAvgCtx, cpuAvgTimestamps, cpuAvgValues, 'CPU Average');

        // Biểu đồ CPU User
        const cpuUserData = allData.Cpu_User;
        const cpuUserTimestamps = Object.values(cpuUserData).map(item => item.timestamp);
        const cpuUserValues = Object.values(cpuUserData).map(item => parseFloat(item.data[0].lastvalue));
        const cpuUserCtx = document.getElementById('cpu_user_chart').getContext('2d');
        drawChart(cpuUserCtx, cpuUserTimestamps, cpuUserValues, 'CPU User');

        // Biểu đồ Memory Usage
        const memoryData = allData.Memory;
        const memoryTimestamps = Object.values(memoryData).map(item => item.timestamp);
        const totalMemory = Object.values(memoryData).map(item => parseFloat(item.data[0].lastvalue));
        const usedMemory = Object.values(memoryData).map(item => parseFloat(item.data[1].lastvalue));
        const memoryCtx = document.getElementById('memory_chart').getContext('2d');
        drawChart(memoryCtx, memoryTimestamps, usedMemory, 'Memory Used');
        
        // Biểu đồ Disk Usage
        const diskData = allData.Disk;
        const diskTimestamps = Object.values(diskData).map(item => item.timestamp);
        const diskValues = Object.values(diskData).map(item => parseFloat(item.data[0].lastvalue));
        const diskCtx = document.getElementById('disk_chart').getContext('2d');
        drawChart(diskCtx, diskTimestamps, diskValues, 'Disk Usage');

        // Biểu đồ Network Traffic
        const networkData = allData.Network;
        const networkTimestamps = Object.values(networkData).map(item => item.timestamp);
        const networkValues = Object.values(networkData).map(item => parseFloat(item.data.lastvalue)); // Không phải mảng
        const networkCtx = document.getElementById('network_chart').getContext('2d');
        drawChart(networkCtx, networkTimestamps, networkValues, 'Network Traffic');
    }
}

document.getElementById('host1').addEventListener('click', (event) => {
    event.preventDefault(); 
    listenForDataChanges('host_10628');
    renderCharts(); 
});
document.getElementById('host2').addEventListener('click', (event) => {
    event.preventDefault();
    listenForDataChanges();
    
});

document.getElementById('host3').addEventListener('click', (event) => {
    event.preventDefault();
    listenForDataChanges();

});

document.getElementById('host4').addEventListener('click', (event) => {
    event.preventDefault();
    listenForDataChanges();

});
window.onload = () => {
    renderCharts(); 
};

// Phần dự đoán

// Hàm gọi API dự đoán
async function getPredictionData(time, data) {
    try {

        const formattedData = data.map(item => {

            return {
                key: item.key, 
                value: item.value
            };
        }).filter(Boolean);

        if (formattedData.length === 0) {
            console.error("Không có dữ liệu hợp lệ để gửi đến API.");
            return null;
        }

        console.log("Dữ liệu sẽ được gửi đến API:", formattedData);

        const response = await fetch("https://shinichikudo2002kks.pythonanywhere.com/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                time: time,   
                data: formattedData   
            })
        });

        // Kiểm tra mã trạng thái của phản hồi
        if (!response.ok) {
            throw new Error(`Lỗi API: ${response.status}`);
        }

        const predictionData = await response.json();
        return predictionData;
    } catch (error) {
        console.error("Lỗi khi gọi API dự đoán:", error);
        return null;
    }
}
function formatTimestamp(timestampString) {
    // Chuyển đổi timestamp từ giây sang miligiây
    const timestampInSeconds = parseFloat(timestampString);
    const timestampInMilliseconds = timestampInSeconds * 1000; // Chuyển đổi sang miligiây

    const date = new Date(timestampInMilliseconds); // Chuyển đổi từ miligiây sang đối tượng Date
    if (isNaN(date.getTime())) { // Kiểm tra xem ngày có hợp lệ không
        console.error("Timestamp không hợp lệ:", timestampString);
        return null; // Trả về null nếu không hợp lệ
    }
    return date.toISOString().slice(0, 19).replace('T', ' '); // Định dạng YYYY-MM-DD HH:MM:SS
}



// Hàm xử lý khi bấm nút Dự đoán
async function handlePrediction() {
    if (currentChartData.length > 0) {
        const time = 24; // Thời gian dự đoán (giờ)
        const data = currentChartData.map(item => {
            const formattedKey = formatTimestamp(item.key); // Định dạng timestamp
            return {
                key: formattedKey, // Đảm bảo timestamp đã được định dạng
                value: item.value // last value
            };
        }).filter(item => item.key !== null);

        if (data.length === 0) {
            console.error("Không có dữ liệu hợp lệ để gửi đến API.");
            return; // Dừng hàm nếu không có dữ liệu hợp lệ
        }

        const predictionData = await getPredictionData(time, data);

        // Kiểm tra phản hồi từ API
        if (predictionData) {
            console.log("Dữ liệu dự đoán:", predictionData);
            // Xử lý và hiển thị dữ liệu dự đoán nếu cần
            const lastTimestamp = currentChartData[currentChartData.length - 1].key;
            const lastTimestampInSeconds = Math.floor(new Date(lastTimestamp).getTime() / 1000);
            const predictedTimestamps = generateTimestamps(lastTimestampInSeconds + 3600, predictionData.length); // Dự đoán mỗi giờ

            // Vẽ biểu đồ với dữ liệu hiện tại và dữ liệu dự đoán
            const cpuAvgCtx = document.getElementById('cpu_avg_chart').getContext('2d');
            const allTimestamps = currentChartData.map(item => item.key).concat(predictedTimestamps);
            const allValues = currentChartData.map(item => item.value).concat(predictionData);
            
            const existingChart = Chart.getChart('cpu_avg_chart');
            if (existingChart) {
                existingChart.destroy();
            }
            

            // Vẽ biểu đồ mới với cả dữ liệu hiện tại và dự đoán
            cpuAvgChart = drawChart(cpuAvgCtx, allTimestamps, allValues, 'CPU Average');
        } else {
            console.log("Không có dữ liệu dự đoán.");
        }
    } else {
        console.log("Không có dữ liệu biểu đồ để dự đoán.");
    }
}

document.getElementById('predict_button').addEventListener('click', handlePrediction);


//Phần dữ liệu đã được dự đoán
function generateTimestamps(startTimestamp, count) {
    const timestamps = [];
    for (let i = 0; i < count; i++) {
        const nextTimestamp = startTimestamp + i * 3600; // 3600 giây = 1 giờ
        timestamps.push(nextTimestamp);
    }
    return timestamps;
}