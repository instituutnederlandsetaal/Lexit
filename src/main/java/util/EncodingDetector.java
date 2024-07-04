package util;

import org.mozilla.universalchardet.UniversalDetector;

import java.io.BufferedInputStream;
import java.io.InputStream;
import java.io.IOException;

public class EncodingDetector {

    public static String detectCharset(InputStream is) {
        try {
            byte[] buf = new byte[4096];
            UniversalDetector detector = new UniversalDetector(null);
            int nread;
            while ((nread = is.read(buf)) > 0 && !detector.isDone()) {
                detector.handleData(buf, 0, nread);
            }
            detector.dataEnd();
            String encoding = detector.getDetectedCharset();
            detector.reset();

            return encoding;

        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

}
