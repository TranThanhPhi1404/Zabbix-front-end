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

// Khai báo 
let cpuAvgChart = null;
let cpuUserChart = null;
let diskChart = null;
let memoryChart = null;
let networkChart = null;

let currentChartData = []; 
let currentCpuUserData = []; 
let currentDiskData = []; 
let currentMemoryData= []; 
let currentNetworkData=[];

let predictedData = {
    cpuAvg: [],
    cpuUser: [],
    disk: [],
    memory: [],
    network: []
};
const hostNames = {
    "host_10628": "HOAN-A",
    
};

// Nhận dữ liệu và gọi hàm vẽ
async function renderCharts({
    cpuAvgTimestamps = [],
    cpuAvgValues = [],
    cpuUserTimestamps = [],
    cpuUserValues = [],
    diskTimestamps = [],
    diskValues = [],
    memoryTimestamps = [],
    memoryValues = [], 
    networkTimestamps = [],
    networkValues = [],
    predictionData = {},
    hostId,

} = {}) {  
    predictedData.cpuAvg = predictionData.cpuAvg || predictedData.cpuAvg;
    predictedData.cpuUser = predictionData.cpuUser || predictedData.cpuUser;
    predictedData.disk = predictionData.disk || predictedData.disk;
    // predictedData.memory = predictionData.memory || predictedData.memory;
    predictedData.network = predictionData.network || predictedData.network;

    const hostName = hostNames[hostId] || hostId;
    console.log(hostName);
    // Vẽ biểu đồ với dữ liệu mới
    if (cpuAvgTimestamps.length > 0 && cpuAvgValues.length > 0) {
        const cpuAvgCtx = document.getElementById('cpu_avg_chart').getContext('2d');
        drawChart(cpuAvgCtx, cpuAvgTimestamps, cpuAvgValues, `Mức sử dụng CPU trung bình của máy ${hostName}`, predictedData.cpuAvg);
    } else {
        console.log("Không có dữ liệu CPU Average để vẽ biểu đồ");
    }

    if (cpuUserTimestamps.length > 0 && cpuUserValues.length > 0) {
        const cpuUserCtx = document.getElementById('cpu_user_chart').getContext('2d');
        drawChart(cpuUserCtx, cpuUserTimestamps, cpuUserValues, `Mức sử dụng CPU của người dùng trên ${hostName}`, predictedData.cpuUser);
    } else {
        console.log("Không có dữ liệu CPU User để vẽ biểu đồ");
    }

    if (diskTimestamps.length > 0 && diskValues.length > 0) {
        const diskCtx = document.getElementById('disk_chart').getContext('2d');
        drawChart(diskCtx, diskTimestamps, diskValues, `Mức sử dụng ổ đĩa trên ${hostName}`, predictedData.disk);
    } else {
        console.log("Không có dữ liệu Disk để vẽ biểu đồ");
    }

    // if (memoryTimestamps.length > 0 && memoryValues.length > 0) {
    //     const memoryCtx = document.getElementById('memory_chart').getContext('2d');
    //     drawChart(memoryCtx, memoryTimestamps, memoryValues, 'Memory Usage', predictedData.memory);
    //     // console.log('Dữ liệu của memory', memoryValues, memoryTimestamps);
    // } else {
    //     console.log("Không có dữ liệu Memory để vẽ biểu đồ");
    // }

    if (networkTimestamps.length > 0 && networkValues.length > 0) {
        const networkCtx = document.getElementById('network_chart').getContext('2d');
        drawChart(networkCtx, networkTimestamps, networkValues, `Lưu lượng mạng trên ${hostName}`, predictedData.network);
    } else {
        console.log("Không có dữ liệu Network để vẽ biểu đồ");
    }
}

// Vẽ biểu đồ
function drawChart(ctx, labels, data, label, predictedValues = [], predictedTimestamps = []) {
    
    let chartInstance;

    // Xác định biểu đồ dựa trên id của canvas
    if (ctx.canvas.id === 'cpu_avg_chart') {
        chartInstance = cpuAvgChart;
    } else if (ctx.canvas.id === 'cpu_user_chart') {
        chartInstance = cpuUserChart;
    } else if (ctx.canvas.id === 'disk_chart') {
        chartInstance = diskChart;
    } 
    // else if (ctx.canvas.id === 'memory_chart') {
    //     chartInstance = memoryChart;
    // }
     else if (ctx.canvas.id === 'network_chart') {
        chartInstance = networkChart;
    }

    // Phá hủy biểu đồ cũ nếu tồn tại
    if (chartInstance) {
        chartInstance.destroy();
    }
    if (ctx.canvas.id === 'cpu_avg_chart' && predictedData.cpuAvg.length > 0) {
        predictedValues = predictedData.cpuAvg;
        predictedTimestamps = generateTimestamps(Number(labels[labels.length - 1]) + 3600, predictedValues.length);
    } else if (ctx.canvas.id === 'cpu_user_chart' && predictedData.cpuUser.length > 0) {
        predictedValues = predictedData.cpuUser;
        predictedTimestamps = generateTimestamps(Number(labels[labels.length - 1]) + 3600, predictedValues.length);
    } else if (ctx.canvas.id === 'disk_chart' && predictedData.disk.length > 0) {
        predictedValues = predictedData.disk;
        predictedTimestamps = generateTimestamps(Number(labels[labels.length - 1]) + 3600, predictedValues.length);
    } 
    // else if (ctx.canvas.id === 'memory_chart' && predictedData.memory.length > 0) {
    //     predictedValues = predictedData.memory;
    //     predictedTimestamps = generateTimestamps(Number(labels[labels.length - 1]) + 3600, predictedValues.length);
    // }
     else if (ctx.canvas.id === 'network_chart' && predictedData.network.length > 0) {
        predictedValues = predictedData.network;
        predictedTimestamps = generateTimestamps(Number(labels[labels.length - 1]) + 3600, predictedValues.length);
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
    const datasets = [{
        label: label,
        data: combinedData,
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false,
    }];
    if (predictedValues.length > 0) {
        // Thêm dataset cho đường dự đoán
        datasets.push({
            label: `Dự đoán ${label}`,
            data: [...Array(data.length).fill(null), ...predictedValues],
            borderColor: 'rgba(255, 99, 132, 1)', // Màu sắc cho đường dự đoán
            borderWidth: 2,
            fill: false,
        });
    }
    
    // Tạo biểu đồ
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allLabels,
            datasets: datasets,
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Thời gian'
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
    } 
    // else if (ctx.canvas.id === 'memory_chart') {
    //     memoryChart = myChart;
    // } 
    else if (ctx.canvas.id === 'network_chart') {
        networkChart = myChart;
    }
    console.log("Biểu đồ đã được vẽ với dữ liệu:",label, {
        labels: allLabels,
        data: combinedData,
        predictedValues: predictedValues,
        predictedTimestamps: predictedTimestamps
    });
}


async function handlePrediction() {
    async function processPrediction(chartId, chartData, chartLabel) {
        console.log(`Processing prediction for ${chartLabel}`);
        if (chartData.length > 0) {
            const time = 24; // Dự đoán cho 24 giờ tiếp theo
            const data = chartData.map(item => ({
                key: formatTimestamp(item.key),
                value: item.value
            }));
    
            const predictionData = await getPredictionData(time, data);
            console.log('Dữ liệu dự đoán nhận được:', predictionData);
            if (predictionData) {
                // Cập nhật predictedData với dữ liệu mới
                predictedData[chartLabel.toLowerCase()] = predictionData[chartLabel.toLowerCase()] || [];
                localStorage.setItem(`${chartLabel.toLowerCase()}PredictedData`, JSON.stringify(predictedData[chartLabel.toLowerCase()]));
            }
            let predictedValues = [];
            let predictedTimestamps = [];
            
    
            if (predictionData && Array.isArray(predictionData) && predictionData.length > 0) {
                predictedValues = predictionData;
                const lastTimestamp = chartData[chartData.length - 1].key;
                predictedTimestamps = generateTimestamps(Number(lastTimestamp) + 3600, predictedValues.length);
            } else {
                // Sử dụng dữ liệu dự đoán đã lưu
                if (predictedData && predictedData[chartLabel]) {
                    
                    predictedValues = predictedData[chartLabel];
                    console.log('Dữ liệu dự đoán từ hàm Process:', predictedValues);
                } else {
                    console.error(`Không có dữ liệu dự đoán cho ${chartLabel}`);
                }
                
                predictedTimestamps = generateTimestamps(Number(chartData[chartData.length - 1].key) + 3600, predictedValues.length);
            }

            // Ghi log để kiểm tra giá trị
            // console.log('predictedValues trước khi vẽ:', predictedValues);
            // console.log('predictedTimestamps trước khi vẽ:', predictedTimestamps);

            // Kiểm tra dữ liệu trước khi vẽ biểu đồ
            if (predictedValues.length === 0) {
                console.warn(`predictedValues vẫn rỗng cho ${chartLabel}. Không thể vẽ biểu đồ.`);
                return; // Thoát ra nếu không có dữ liệu dự đoán
            }
            localStorage.setItem('predictedData', JSON.stringify(predictedData));
            console.log('Predicted data saved to localStorage:', predictedData);
            const chartCtx = document.getElementById(chartId).getContext('2d');
            drawChart(chartCtx, chartData.map(item => item.key), chartData.map(item => item.value), chartLabel, predictedValues, predictedTimestamps);
        }
    }
    // Sử dụng Promise.all để chạy các biểu đồ song song thay vì async/await từng cái
    const predictionPromises = [
        processPrediction('cpu_avg_chart', currentChartData, 'CPU Average'),
        processPrediction('cpu_user_chart', currentCpuUserData, 'CPU User'),
        processPrediction('disk_chart', currentDiskData, 'Disk Usage'),
        processPrediction('memory_chart', currentMemoryData, 'Memory Usage'),
        processPrediction('network_chart', currentNetworkData, 'Network Traffic')
    ];

    // Chờ tất cả các dự đoán hoàn thành
    await Promise.all(predictionPromises);
    console.log('Tất cả các dự đoán đã hoàn thành.');

    
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

        if (predictionData && predictionData.length > 0) {
            // Lưu dự đoán vào localStorage mà không cần sử dụng label
            const predictionToSave = {
                values: predictionData || [],
                time: time || []
            };

            // Lưu vào localStorage với tên cố định cho tất cả biểu đồ
            localStorage.setItem('predictionData', JSON.stringify(predictionToSave));
            console.log('Dữ liệu được lưu:', predictionToSave);
        } else {
            console.error("Dữ liệu dự đoán không hợp lệ hoặc không có dữ liệu.");
        }

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
            console.log('Tất cả dữ liệu khi thay đổi: ',allData);
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
            const memoryValues = Object.values(memoryData).map(item => parseFloat(item.data[1].lastvalue));

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
                value: parseFloat(item.data[1].lastvalue)
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
                memoryValues,
                networkTimestamps,
                networkValues,
                hostId
                
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
    // handlePrediction();
    window.location.href = 'prediction.html';
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

window.onload = () => {
    document.getElementById('host1').click(); 
};