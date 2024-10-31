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



async function renderCharts({
    cpuAvgTimestamps = [],
    cpuAvgValues = [],
    cpuUserTimestamps = [],
    cpuUserValues = [],
    diskTimestamps = [],
    diskValues = [],
    memoryTimestamps = [],
    totalMemory = [],  
    usedMemory = [], 
    networkTimestamps = [],
    networkValues = []

} = {}) {  
    if (cpuAvgTimestamps.length > 0 && cpuAvgValues.length > 0) {
        const cpuAvgCtx = document.getElementById('cpu_avg_chart').getContext('2d');
        drawChart(cpuAvgCtx, cpuAvgTimestamps, cpuAvgValues, 'CPU Average');
    } else {
        console.log("Không có dữ liệu CPU Average để vẽ biểu đồ");
    }

    if (cpuUserTimestamps.length > 0 && cpuUserValues.length > 0) {
        const cpuUserCtx = document.getElementById('cpu_user_chart').getContext('2d');
        drawChart(cpuUserCtx, cpuUserTimestamps, cpuUserValues, 'CPU User');
    } else {
        console.log("Không có dữ liệu CPU User để vẽ biểu đồ");
    }
    // Vẽ biểu đồ cho Disk
    if (diskTimestamps.length > 0 && diskValues.length > 0) {
        const diskCtx = document.getElementById('disk_chart').getContext('2d');
        drawChart(diskCtx, diskTimestamps, diskValues, 'Disk Usage');
    } else {
        console.log("Không có dữ liệu Disk để vẽ biểu đồ");
    }

    // Vẽ biểu đồ cho Memory
    if (memoryTimestamps.length > 0 && totalMemory.length > 0) {
        const memoryCtx = document.getElementById('memory_chart').getContext('2d');
        drawChart(memoryCtx, memoryTimestamps, totalMemory, 'Memory Usage');
    } else {
        console.log("Không có dữ liệu Memory để vẽ biểu đồ");
    }

    // Vẽ biểu đồ cho Network
    if (networkTimestamps.length > 0 && networkValues.length > 0) {
        const networkCtx = document.getElementById('network_chart').getContext('2d');
        drawChart(networkCtx, networkTimestamps, networkValues, 'Network Traffic');
    } else {
        console.log("Không có dữ liệu Network để vẽ biểu đồ");
    }
}
let cpuAvgChart = null;
let cpuUserChart = null;
let diskChart = null;
let memoryChart = null;
let networkChart = null;
function drawChart(ctx, labels, data, label, predictedValues = [], predictedTimestamps = []) {
    if (ctx.canvas.id === 'cpu_avg_chart' && cpuAvgChart) {
        cpuAvgChart.destroy();
    } else if (ctx.canvas.id === 'cpu_user_chart' && cpuUserChart) {
        cpuUserChart.destroy();
    }else if (ctx.canvas.id === 'disk_chart' && diskChart) {
        diskChart.destroy();
    } else if (ctx.canvas.id === 'memory_chart' && memoryChart) {
        memoryChart.destroy();
    } else if (ctx.canvas.id === 'network_chart' && networkChart) {
        networkChart.destroy();
    }

    // Kết hợp nhãn và dữ liệu
    const allLabels = [
        ...labels.map(t => new Date(t * 1000).toLocaleString()), 
        ...predictedTimestamps.map(t => new Date(t * 1000).toLocaleString())
    ];

    // Kết hợp dữ liệu
    const combinedData = [
        ...data,                     // Dữ liệu thực tế
        ...Array(predictedValues.length).fill(null) // Dữ liệu dự đoán (null cho đến khi giá trị dự đoán)
    ];

    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels:  allLabels,
            datasets: [
                {
                    label: label,
                    data:  [...data, ...Array(predictedValues.length).fill(null)],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false,
                },
                ...(predictedValues.length > 0 ? [{
                    label: `Dự đoán ${label}`,
                    data: [...Array(data.length).fill(null), ...predictedValues],
                    borderColor: 'rgba(255, 99, 132, 1)', 
                    borderWidth: 2,
                    fill: false,
                    
                }] : []),
            ],
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
    if (ctx.canvas.id === 'cpu_avg_chart') {
        cpuAvgChart = myChart;
    } else if (ctx.canvas.id === 'cpu_user_chart') {
        cpuUserChart = myChart;
    }else if (ctx.canvas.id === 'disk_chart') {
        diskChart = myChart;
    } else if (ctx.canvas.id === 'memory_chart') {
        memoryChart = myChart;
    } else if (ctx.canvas.id === 'network_chart') {
        networkChart = myChart;
    }
    console.log("Biểu đồ đã được vẽ với dữ liệu:",label, {
        labels: allLabels,
        data: combinedData,
        predictedValues: predictedValues,
        predictedTimestamps: predictedTimestamps
    });
}
let currentChartData = []; let currentCpuUserData = []; let currentDiskData = []; let currentMemoryData= []; let currentNetworkData=[];
async function handlePrediction() {
    // console.log('Starting prediction process...');
    // console.log('currentChartData:', currentChartData);
    // console.log('currentCpuUserData:', currentCpuUserData);
    // console.log('currentDiskData:', currentDiskData);
    // console.log('currentMemoryData:', currentMemoryData);
    // console.log('currentNetworkData:', currentNetworkData);
    async function processPrediction(chartId, chartData, chartLabel) {
        console.log(`Processing prediction for ${chartLabel}`);
        if (chartData.length > 0) {
            console.log("Current Chart Data:", chartData);
            const time = 24; // Dự đoán cho 24 giờ tiếp theo
            const data = chartData.map(item => ({
                key: formatTimestamp(item.key),
                value: item.value
            }));
            console.log(" Data:",data);

            const predictionData = await getPredictionData(time, data);
            console.log(`Dữ liệu dự đoán nhận được từ API của hàm handle cho ${chartLabel}:`, predictionData);

            if (predictionData && predictionData.length > 0) {
                const predictedValues = predictionData.map(item => {
                    console.log('Item:', item); // Log để kiểm tra cấu trúc
                    return item; 
                });
                console.log("Predicted Values:", predictedValues);

                const lastTimestamp = chartData[chartData.length - 1].key;
                console.log(lastTimestamp)
                const predictedTimestamps = generateTimestamps(Number(lastTimestamp) + 3600, predictedValues.length);
                console.log("Predicted Timestamps:", predictedTimestamps);

                const chartCtx = document.getElementById(chartId).getContext('2d');
                drawChart(chartCtx, chartData.map(item => item.key), chartData.map(item => item.value), chartLabel, predictedValues, predictedTimestamps);
            } else {
                console.log(`Không có dữ liệu dự đoán cho ${chartLabel}.`);
            }
        }
    }

    // Dự đoán cho cả CPU Average và CPU User
    await processPrediction('cpu_avg_chart', currentChartData, 'CPU Average');
    await processPrediction('cpu_user_chart', currentCpuUserData, 'CPU User');
    await processPrediction('disk_chart', currentDiskData, 'Disk Usage');
    await processPrediction('memory_chart', currentMemoryData, 'Memory Usage');
    await processPrediction('network_chart', currentNetworkData, 'Network Traffic');
}

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
        console.log("Dữ liệu dự đoán nhận được từ API của hàm getPre:", predictionData);
        return predictionData;
    } catch (error) {
        console.error("Lỗi khi gọi API dự đoán:", error);
        return null;
    }
}

// Lắng nghe sự kiện thay đổi dữ liệu
function listenForDataChanges(hostId) {
    const dbRef = ref(db, hostId); // Đường dẫn tới các mục
    onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
            const allData = snapshot.val(); // Lấy giá trị dữ liệu
            console.log(allData);
            const cpuAvgData = allData.Cpu_Avg;
            const cpuUserData = allData.Cpu_User;
            const diskData = allData.Disk;
            const memoryData = allData.Memory;
            const networkData = allData.Network;

            // Lấy timestamps và giá trị của CPU Average
            const cpuAvgTimestamps = Object.values(cpuAvgData).map(item => item.timestamp);
            const cpuAvgValues = Object.values(cpuAvgData).map(item => parseFloat(item.data[0].lastvalue));

            // Lấy timestamps và giá trị của CPU User
            const cpuUserTimestamps = Object.values(cpuUserData).map(item => item.timestamp);
            const cpuUserValues = Object.values(cpuUserData).map(item => parseFloat(item.data[0].lastvalue));
            // Lấy timestamps và giá trị của Disk
            const diskTimestamps = Object.values(diskData).map(item => item.timestamp);
            const diskValues = Object.values(diskData).map(item => parseFloat(item.data[0].lastvalue));

            // Lấy timestamps và giá trị của Memory
            const memoryTimestamps = Object.values(memoryData).map(item => item.timestamp);
            const totalMemory = Object.values(memoryData).map(item => parseFloat(item.data[0].lastvalue));
            const usedMemory = Object.values(memoryData).map(item => parseFloat(item.data[1].lastvalue));

            // Lấy timestamps và giá trị của Network
            const networkTimestamps = Object.values(networkData).map(item => item.timestamp);
            const networkValues = Object.values(networkData).map(item => parseFloat(item.data.lastvalue));
            // Gán dữ liệu vào các biến current
            currentChartData = Object.values(cpuAvgData).map(item => ({
                key: item.timestamp,
                value: parseFloat(item.data[0].lastvalue)
            }));

            currentCpuUserData = Object.values(cpuUserData).map(item => ({
                key: item.timestamp,
                value: parseFloat(item.data[0].lastvalue)
            }));
            currentDiskData = Object.values(diskData).map(item => ({
                key: item.timestamp,
                value: parseFloat(item.data[0].lastvalue)
            }));
            currentMemoryData = Object.values(memoryData).map(item => ({
                key: item.timestamp,
                total: parseFloat(item.data[0].lastvalue),
                used: parseFloat(item.data[1].lastvalue)
            }));
            currentNetworkData = Object.values(networkData).map(item => ({
                key: item.timestamp,
                value: parseFloat(item.data.lastvalue) 
            }));
            
            
            // Gọi hàm vẽ biểu đồ với dữ liệu đã lấy được
            renderCharts({
                cpuAvgTimestamps,
                cpuAvgValues,
                cpuUserTimestamps,
                cpuUserValues,
                diskTimestamps,
                diskValues,
                memoryTimestamps,
                totalMemory,
                usedMemory,
                networkTimestamps,
                networkValues
            });
        } else {
            console.log("Không có dữ liệu" , hostId);
        }
    }, (error) => {
        console.error("Lỗi khi lắng nghe dữ liệu:", error);
    });
}
function generateTimestamps(startTimestamp, count) {
    const timestamps = [];
    for (let i = 0; i < count; i++) {
        const nextTimestamp = startTimestamp + i * 3600; 
        timestamps.push(nextTimestamp);
    }
    return timestamps;
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
document.getElementById('predict_button').addEventListener('click', () => {
    console.log('Button predict clicked');
    handlePrediction();
});
document.getElementById('host1').addEventListener('click', (event) => {
    event.preventDefault(); 
    listenForDataChanges('host_10628');
    renderCharts(); 
});
document.getElementById('host2').addEventListener('click', (event) => {
    event.preventDefault();
    listenForDataChanges();
    renderCharts(); 
});
document.getElementById('host3').addEventListener('click', (event) => {
    event.preventDefault();
    listenForDataChanges();
    renderCharts(); 
});
document.getElementById('host4').addEventListener('click', (event) => {
    event.preventDefault();
    listenForDataChanges();
    renderCharts(); 
});
window.onload = () => {
    renderCharts(); 
};