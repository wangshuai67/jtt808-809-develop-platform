// 创建测试线路的简单脚本
const routeData = {
    name: '测试线路1',
    minSpeed: 30,
    maxSpeed: 80,
    type: 'normal',
    startName: '起点',
    endName: '终点',
    points: [
        {lng: 116.397428, lat: 39.90923, speed: 60},
        {lng: 116.407428, lat: 39.91923, speed: 65},
        {lng: 116.417428, lat: 39.92923, speed: 70}
    ]
};

// 转换为表单数据
const formData = new URLSearchParams();
formData.append('name', routeData.name);
formData.append('minSpeed', routeData.minSpeed);
formData.append('maxSpeed', routeData.maxSpeed);
formData.append('type', routeData.type);
formData.append('startName', routeData.startName);
formData.append('endName', routeData.endName);
formData.append('points', JSON.stringify(routeData.points));

console.log('Form data to send:');
console.log(formData.toString());