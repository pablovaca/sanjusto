package com.crm.filters;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.*;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Define "HTTP access control (CORS)".
 *
 * @author Andres Postiglioni.
 * @see <a href="http://enable-cors.org/server.html">http://enable-cors.org/server.html</a>
 */
//@Component
public class SimpleCORSFilter implements Filter {

    protected static final Logger log = LogManager
            .getLogger(SimpleCORSFilter.class);


    /**
     * {@inheritDoc}
     */
    public void doFilter(ServletRequest req, ServletResponse res,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletResponse response = (HttpServletResponse) res;

        this.setResponseHeader(response, "Access-Control-Allow-Origin", "*");
        this.setResponseHeader(response, "Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
        this.setResponseHeader(response, "Access-Control-Max-Age", "3600");
        this.setResponseHeader(response, "Access-Control-Allow-Headers", "origin, x-requested-with, content-type, Content-Range, Content-Disposition, Content-Description, accept, token, language");

        chain.doFilter(req, res);
    }

    private void setResponseHeader(HttpServletResponse response, String header,
                                   String value) {
        if (value != null && !"".equals(value.trim())) {
            response.setHeader(header, value);
        }
    }

    /**
     * {@inheritDoc}
     */
    public void init(FilterConfig filterConfig) {
    }

    /**
     * {@inheritDoc}
     */
    public void destroy() {
    }
}