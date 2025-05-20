using System;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApplication1.Models;

namespace WebApplication1.ApiControllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/cart")]
    public class CartController : ApiController
    {
        DiorDBEntities1 db = new DiorDBEntities1();

        // GET: api/cart
        [HttpGet]
        [Route("")]
        public IHttpActionResult GetAllCarts()
        {
            var carts = db.Carts.ToList();
            return Ok(carts);
        }

        // GET: api/cart/user/5
        [HttpGet]
        [Route("user/{userId:int}")]
        public IHttpActionResult GetCartByUserId(int userId)
        {
            var userCart = db.Carts
                .Where(c => c.UserID == userId)
                .Select(c => new
                {
                    c.CartID,
                    c.UserID,
                    c.PerfumeID,
                    c.CartQty,
                    c.TotalPrice,
                    c.Perfume.PerfumeName,
                    c.Perfume.PerfumeImg,
                    c.Perfume.PerfumePrice
                })
                .ToList();
           
            return Ok(userCart);
        }


        // POST: api/cart/add
        [HttpPost]
        [Route("add")]
        public IHttpActionResult AddToCart(Cart cart)
        {
            try
            {
                var existingCartItem = db.Carts.FirstOrDefault(c =>
                    c.UserID == cart.UserID && c.PerfumeID == cart.PerfumeID);

                if (existingCartItem != null)
                {
                    // Update quantity and total price
                    existingCartItem.CartQty += cart.CartQty;
                    existingCartItem.TotalPrice += cart.TotalPrice;
                }
                else
                {
                    db.Carts.Add(cart);
                }

                db.SaveChanges();
                return Ok("Item added or updated in cart.");
            }
            catch (Exception)
            {
                return InternalServerError(new Exception("Failed to add item to cart."));
            }
        }

        // PUT: api/cart/update
        [HttpPut]
        [Route("update")]
        public IHttpActionResult UpdateCart(Cart cart)
        {
            var existing = db.Carts.FirstOrDefault(c => c.CartID == cart.CartID);
            if (existing == null)
                return NotFound();

            existing.CartQty = cart.CartQty;
            existing.TotalPrice = cart.TotalPrice;

            db.SaveChanges();
            return Ok("Cart updated.");
        }

        // DELETE: api/cart/delete/5
        [HttpDelete]
        [Route("delete/{id:int}")]
        public IHttpActionResult DeleteCartItem(int id)
        {
            var cart = db.Carts.Find(id);
            if (cart == null)
                return NotFound();

            db.Carts.Remove(cart);
            db.SaveChanges();
            return Ok("Cart item deleted.");
        }

        // DELETE: api/cart/clear/user/5
        [HttpDelete]
        [Route("clear/user/{userId:int}")]
        public IHttpActionResult ClearCartByUser(int userId)
        {
            var cartItems = db.Carts.Where(c => c.UserID == userId).ToList();
            if (!cartItems.Any())
                return NotFound();

            db.Carts.RemoveRange(cartItems);
            db.SaveChanges();
            return Ok("Cart cleared for user.");
        }
    }
}
