package resources;

import jakarta.inject.Singleton;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;

import java.util.ArrayList;

// this class is meant to be used to wake up the server
// and make sure that a JSESSIONID is created
// since that is needed for the OIDC login to work


@Path("/hello")
public class WakeUpResource {

    @Path("lexit")
    @GET
    @Produces({MediaType.APPLICATION_XML})
    public DbResponseObject sayHelloLexit(
            @Context ServletContext context,
            @Context HttpServletRequest httpServletRequest
    ) {

        // trick to make sure that a session ID is created!
        String sessionId = httpServletRequest.getSession(true).getId();
        // and return it
        DbResponseObject dbResponseObject = new DbResponseObject();
        dbResponseObject.setResponse("Hello everybody! The session ID is "+sessionId);

        return dbResponseObject;
    }
}

