package resources;

public final class SharedResources {
	
	// unique instance of the ResourceContext Service
	// shared by all resources (so that they can share the same database access objects and user rights info)

    public static final ResourceContextService SERVICE = new ResourceContextService();

    private SharedResources() {
    }
}