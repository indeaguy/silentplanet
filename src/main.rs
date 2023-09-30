// This line declares that we're using features that aren't stable yet in Rust. 
// Rocket uses some advanced features of Rust that are only available in the nightly build.
#![feature(proc_macro_hygiene, decl_macro)]

// This line imports the `rocket` crate and its macros, which we'll be using to define our server and its routes.
#[macro_use] extern crate rocket;

// This line imports the `rocket_contrib` crate, which includes optional features for the `rocket` crate. 
// In this case, we're using it for the `serve` feature to serve static files.
extern crate rocket_contrib;

// Here we import the `StaticFiles` struct from the `serve` module. 
// `StaticFiles` is a handler that serves static files from a directory.
use rocket_contrib::serve::StaticFiles;

// This function is a route handler for the route "/", 
// it returns a static string whenever a GET request is made to the root ("/") of the server.
#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

// This is the main function, where execution begins.
fn main() {
    rocket::ignite()  // This function starts a new instance of a Rocket application.
        .mount("/", routes![index])  // This method mounts a collection of routes to a path. In this case, we're mounting the `index` route to "/".
        .mount("/static", StaticFiles::from("static"))  // Here, we're mounting static file serving to the path "/static". All files in the "static" directory will be served from this path.
        .mount("/geojson", StaticFiles::from("geojson"))  // Serve geojson files
        .launch();  // This method starts the server and begins listening for and responding to requests.
}
