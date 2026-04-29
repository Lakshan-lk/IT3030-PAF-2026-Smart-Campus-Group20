import java.sql.*;

public class DbCheck {
    public static void main(String[] args) throws Exception {
        String url = System.getenv("JDBC_URL");
        if (url == null) {
            url = "jdbc:postgresql://db.bgesgbxmnowndvwzonjz.supabase.co:5432/postgres";
        }
        String user = "postgres";
        String password = System.getenv("POSTGRES_PASSWORD");
        
        System.out.println("Connecting to database...");
        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connected! Executing V11 migration manually...");
            
            try (Statement stmt = conn.createStatement()) {
                stmt.execute("ALTER TABLE equipment ADD COLUMN is_hiring_equipment BOOLEAN NOT NULL DEFAULT FALSE");
                System.out.println("is_hiring_equipment added - done");
            } catch (Exception e) { System.out.println(e.getMessage()); }
            
            try (Statement stmt = conn.createStatement()) {
                stmt.execute("ALTER TABLE equipment ADD COLUMN description VARCHAR(1000)");
                System.out.println("description added - done");
            } catch (Exception e) { System.out.println(e.getMessage()); }

            System.out.println("All queries executed.");
        }
    }
}
