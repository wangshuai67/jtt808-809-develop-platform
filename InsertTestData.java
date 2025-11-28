import java.sql.*;

public class InsertTestData {
    public static void main(String[] args) {
        String url = "jdbc:h2:./simulator_new";
        String user = "h2db";
        String password = "123456";
        
        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            // Insert test route
            String insertRoute = "INSERT INTO x_route (id, name, minSpeed, maxSpeed, mileages, fingerPrint, type, startName, endName, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
            try (PreparedStatement stmt = conn.prepareStatement(insertRoute)) {
                stmt.setLong(1, 1);
                stmt.setString(2, "Test Route 1");
                stmt.setInt(3, 30);
                stmt.setInt(4, 80);
                stmt.setInt(5, 50);
                stmt.setString(6, "test_route_1");
                stmt.setString(7, "normal");
                stmt.setString(8, "Start");
                stmt.setString(9, "End");
                stmt.executeUpdate();
                System.out.println("Route inserted successfully");
            }
            
            // Insert route points (Beijing coordinates)
            String insertPoint = "INSERT INTO x_route_point (routeId, longitude, latitude) VALUES (?, ?, ?)";
            double[][] points = {
                {116.397428, 39.90923},
                {116.407428, 39.91923},
                {116.417428, 39.92923},
                {116.427428, 39.93923},
                {116.437428, 39.94923}
            };
            
            try (PreparedStatement stmt = conn.prepareStatement(insertPoint)) {
                for (double[] point : points) {
                    stmt.setLong(1, 1);
                    stmt.setDouble(2, point[0]);
                    stmt.setDouble(3, point[1]);
                    stmt.executeUpdate();
                }
                System.out.println("Route points inserted successfully");
            }
            
            // Insert test tasks
            String insertTask = "INSERT INTO x_schedule_task (id, taskId, routeId, vehicleId, fromTime, endTime, ratio, daysInterval, driveCount, lastDriveTime, runCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            try (PreparedStatement stmt = conn.prepareStatement(insertTask)) {
                // First task
                stmt.setLong(1, 1);
                stmt.setLong(2, 1);
                stmt.setLong(3, 1);
                stmt.setLong(4, 1);
                stmt.setString(5, "08:00");
                stmt.setString(6, "18:00");
                stmt.setInt(7, 100);
                stmt.setInt(8, 1);
                stmt.setInt(9, 0);
                stmt.setNull(10, Types.TIMESTAMP);
                stmt.setInt(11, 0);
                stmt.executeUpdate();
                
                // Second task
                stmt.setLong(1, 2);
                stmt.setLong(2, 2);
                stmt.setLong(3, 1);
                stmt.setLong(4, 2);
                stmt.setString(5, "09:00");
                stmt.setString(6, "17:00");
                stmt.setInt(7, 80);
                stmt.setInt(8, 1);
                stmt.setInt(9, 0);
                stmt.setNull(10, Types.TIMESTAMP);
                stmt.setInt(11, 0);
                stmt.executeUpdate();
                
                System.out.println("Tasks inserted successfully");
            }
            
            System.out.println("All test data inserted successfully!");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}