package util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class DelimiterDetector {

    public static char detectDelimiter(InputStream inputStream) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        String line = reader.readLine();

        if (line == null) {
            throw new IOException("Empty input stream");
        }

        int commaCount = countChar(line, ',');
        int tabCount = countChar(line, '\t');
        int semicolonCount = countChar(line, ';');

        if (tabCount > commaCount && tabCount > semicolonCount) {
            return '\t';
        } else if (semicolonCount > commaCount) {
            return ';';
        } else {
            return ',';
        }
    }

    private static int countChar(String line, char charToCount) {
        int count = 0;
        for (int i = 0; i < line.length(); i++) {
            if (line.charAt(i) == charToCount) {
                count++;
            }
        }
        return count;
    }
}
