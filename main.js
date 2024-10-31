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
function drawChart(ctx, labels, data, label ) {
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(t => new Date(t * 1000).toLocaleString()), 
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
let currentCpuUserData = [];
let currentMemoryData = [];
let currentDiskData = [];
let currentNetworkData = [];

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
        currentCpuUserData = cpuUserTimestamps.map((timestamp, index) => ({
            key: timestamp,
            value: cpuUserValues[index]
        }));
        const cpuUserCtx = document.getElementById('cpu_user_chart').getContext('2d');
        if (cpuUserChart) {
            cpuUserChart.destroy();
            cpuUserChart = null;
        }
        cpuUserChart = drawChart(cpuUserCtx, cpuUserTimestamps, cpuUserValues, 'CPU User');

        // Biểu đồ Memory Usage
        const memoryData = allData.Memory;
        const memoryTimestamps = Object.values(memoryData).map(item => item.timestamp);
        const usedMemory = Object.values(memoryData).map(item => parseFloat(item.data[0].lastvalue));
        currentMemoryData = memoryTimestamps.map((timestamp, index) => ({
            key: timestamp,
            value: usedMemory[index]
        }));
        const memoryCtx = document.getElementById('memory_chart').getContext('2d');
        if (memoryChart) {
            memoryChart.destroy();
            memoryChart  = null;
        }
        memoryChart = drawChart(memoryCtx, memoryTimestamps, usedMemory, 'Memory Used');
        
        // Biểu đồ Disk Usage
        const diskData = allData.Disk;
        const diskTimestamps = Object.values(diskData).map(item => item.timestamp);
        const diskValues = Object.values(diskData).map(item => parseFloat(item.data[0].lastvalue));
        currentDiskData = diskTimestamps.map((timestamp, index) => ({
            key: timestamp,
            value: diskValues[index]
        }));
        const diskCtx = document.getElementById('disk_chart').getContext('2d');
        if (diskChart) {
            diskChart.destroy();
            diskChart  = null;
        }
        diskChart = drawChart(diskCtx, diskTimestamps, diskValues, 'Disk Usage');

        // Biểu đồ Network Traffic
        const networkData = allData.Network;
        const networkTimestamps = Object.values(networkData).map(item => item.timestamp);
        const networkValues = Object.values(networkData).map(item => parseFloat(item.data.lastvalue));
        currentNetworkData = networkTimestamps.map((timestamp, index) => ({
            key: timestamp,
            value: networkValues[index]
        }));
        const networkCtx = document.getElementById('network_chart').getContext('2d');
        if (networkChart) {
            networkChart.destroy();
            networkChart  = null;
        }
        networkChart = drawChart(networkCtx, networkTimestamps, networkValues, 'Network Traffic');
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
    const timestampInSeconds = parseFloat(timestampString);
    const timestampInMilliseconds = timestampInSeconds * 1000; 
    const date = new Date(timestampInMilliseconds); 
    if (isNaN(date.getTime())) { 
        console.error("Timestamp không hợp lệ:", timestampString);
        return null; 
    }
    return date.toISOString().slice(0, 19).replace('T', ' '); 
}






async function handlePrediction() {
    async function processPrediction(chartId, chartData, chartLabel, chartInstance) {
        if (chartData.length > 0) {
            const time = 24; 
            const data = chartData.map(item => {
                const formattedKey = formatTimestamp(item.key);
                return {
                    key: formattedKey,
                    value: item.value
                };
            }).filter(item => item.key !== null);

            if (data.length === 0) {
                console.error(`Không có dữ liệu hợp lệ để gửi đến API cho ${chartLabel}.`);
                return;
            }

            const predictionData = await getPredictionData(time, data);

            if (predictionData && predictionData.length > 0) {
                
                const predictedValues = predictionData.map(item => item); // Dữ liệu dự đoán từ API
                console.log("Predicted values:", predictedValues);
            
                const lastTimestamp = chartData[chartData.length - 1].key;
                const lastTimestampInSeconds = Math.floor(new Date(lastTimestamp).getTime() / 1000);
                const predictedTimestamps = generateTimestamps(lastTimestampInSeconds + 3600, predictedValues.length);
            
                const chartCtx = document.getElementById(chartId).getContext('2d');
                
                // Kết hợp dữ liệu thực tế và dữ liệu dự đoán
                const allTimestamps = [...chartData.map(item => item.key), ...predictedTimestamps];
                const allValues = [...chartData.map(item => item.value), ...predictedValues];

                console.log("Timestamps hiện tại:", chartData.map(item => item.key));
                console.log("Mốc thời gian cuối cùng:", lastTimestampInSeconds);
                console.log("Mốc thời gian dự đoán:", predictedTimestamps);
                console.log("Giá trị dự đoán:", predictedValues);

                const existingChart = Chart.getChart(chartId);
                if (existingChart) {
                    existingChart.destroy();
                }
            
                // Vẽ lại biểu đồ với dữ liệu thực tế và dự đoán
                const dataset = [
                    {
                        label: chartLabel,
                        data: allValues,
                        borderColor: 'rgba(75, 192, 192, 1)', // Màu cho dữ liệu thực tế
                        borderWidth: 2,
                        fill: false,
                    },
                    // {
                    //     label: `Dự đoán ${chartLabel}`,
                    //     data: predictedValues,
                    //     borderColor: 'rgba(255, 99, 132, 1)', // Màu cho dữ liệu dự đoán
                    //     borderWidth: 2,
                    //     fill: false,
                    // },
                ];
            
                const myChart = new Chart(chartCtx, {
                    type: 'line',
                    data: {
                        labels: [...allTimestamps.map(t => new Date(t * 1000).toLocaleString())],
                        datasets: dataset, // Sử dụng dataset với cả dữ liệu thực tế và dự đoán
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Time',
                                },
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: chartLabel,
                                },
                            },
                        },
                    },
                });
            } else {
                console.log(`Không có dữ liệu dự đoán cho ${chartLabel}.`);
            }
        } else {
            console.log(`Không có dữ liệu biểu đồ để dự đoán cho ${chartLabel}.`);
        }
    }

    // Dự đoán cho các biểu đồ
    await processPrediction('cpu_avg_chart', currentChartData, 'CPU Average', cpuAvgChart);
    await processPrediction('cpu_user_chart', currentCpuUserData, 'CPU User', cpuUserChart);
    await processPrediction('memory_chart', currentMemoryData, 'Memory Usage', memoryChart);
    await processPrediction('disk_chart', currentDiskData, 'Disk Usage', diskChart);
    await processPrediction('network_chart', currentNetworkData, 'Network Traffic', networkChart);
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