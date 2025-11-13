package resources;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;

public class SessionFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest r = (HttpServletRequest) request;
        // This will create a session if one does not exist
        r.getSession(true);

        // Time request
        long start = System.currentTimeMillis();
        chain.doFilter(request, response);
        long dur = System.currentTimeMillis() - start;

        // Log request
        String params = r.getQueryString() != null ? "?" + r.getQueryString() : "";
        String url = r.getRequestURL() + params;
        String time = Instant.now().truncatedTo(ChronoUnit.SECONDS).toString();
        System.out.printf("[%s] in %d ms: %s %s%n", time, dur, r.getMethod(), url);
    }

    @Override
    public void destroy() {
    }
}
