package util;

import java.io.*;
import java.nio.charset.StandardCharsets;

public class FileTypeDetector {

    public static String determineFileType(InputStream is) throws IOException {

        PushbackInputStream pushbackInputStream = new PushbackInputStream(is, 8);
        byte[] firstFewBytes = new byte[8];
        pushbackInputStream.read(firstFewBytes);
        pushbackInputStream.unread(firstFewBytes);

        String hex = bytesToHex(firstFewBytes).toUpperCase();

        if (hex.startsWith("D0CF11E0") || hex.startsWith("504B0304")) {  // PK...... ZIP (XLSX) or old OLE (XLS)
            if (hex.startsWith("D0CF11E0")) {
                return "XLS";
            } else if (hex.startsWith("504B0304")) {
                return "XLSX";
            }
        } else if (isTextFile(firstFewBytes)) {
            return "CSV";
        }

        return "Unknown";
    }

    private static boolean isTextFile(byte[] bytes) {
        for (byte b : bytes) {
            if (b < 0x09 || (b > 0x0D && b < 0x20 && b != 0x1B)) return false;
        }
        return true;
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
    }


    public static boolean isCSVFile(FileInputStream fis) throws Exception {

        BufferedReader reader = new BufferedReader(new InputStreamReader(fis, StandardCharsets.UTF_8));
        fis.getChannel().position(0); // Reset the stream to the beginning for a fresh read
        String firstLine = reader.readLine();
        fis.getChannel().position(0); // Reset again after checking
        return firstLine != null && (firstLine.contains(",") || firstLine.contains(";") || firstLine.contains("\t"));
    }
}
