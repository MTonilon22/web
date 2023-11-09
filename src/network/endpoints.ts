/**
 * Contains all the endpoints used in the application.
 */
enum Endpoints {
  Login = "/login",
  ForgotPassword = "/forgot",
  ResetPassword = "/reset",
  ResetPasswordToken = "/reset/:token",
  ProductsSlug = "/products/:slug",
  Products = "/products",
  PhotosHash = "/photos/:hash",
  ReferenceHash = "/photos/:hash/reference",
  StudentsKey = "/students/:key",
  Students = "/students",
  Announcements = "/announcements",
  AnnouncementsId = "/announcements/:id",
  Events = "/events",
  EventsId = "/events/:id",
  EventsNext = "/events/next",
  Env = "/env",
  EnvKey = "/env/:key",
  Courses = "/courses",
  Orders = "/orders",
  OrdersKey = "/orders/:id/:key",
  QRCode = "/qrcode/:q",
  QRCodeDark = "/qrcode/:q/dark",
  OrdersUnique = "/orders/unique/:uniqueId",
  OrdersReference = "/orders/reference/:reference",
}

export default Endpoints;