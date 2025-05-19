using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApplication1.Models;

namespace WebApplication1.ApiControllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/bill")]
    public class BillController : ApiController
    {
        DiorDBEntities1 db = new DiorDBEntities1();

        // GET: api/bill
        [HttpGet]
        [Route("")]
        public IHttpActionResult GetAllBills()
        {
            var bills = db.Bills
                .Select(b => new
                {
                    b.BillID,
                    b.UserID,
                    CustomerName = b.UserDetail.UserName,   
                    BillDate = b.BillDate,
                    b.BillAmt
                })
                .ToList();

            return Ok(bills);
        }


        // GET: api/bill/{billId}
        [HttpGet]
        [Route("{billId:int}")]
        public IHttpActionResult GetBillById(int billId)
        {
            var bill = db.Bills.Find(billId);
            if (bill == null)
                return NotFound();

            return Ok(bill);
        }

        // GET: api/bill/customer/{customerId}
        [HttpGet]
        [Route("customer/{customerId:int}")]
        public IHttpActionResult GetBillsByCustomer(int customerId)
        {
            var bills = db.Bills.Where(b => b.UserID == customerId).ToList();
            return Ok(bills);
        }

        // GET: api/bill/details/{billId}
        [HttpGet]
        [Route("details/{billId:int}")]
        public IHttpActionResult GetBillDetails(int billId)
        {
            var details = db.BillDetails
                            .Where(d => d.BillID == billId)
                            .Select(d => new
                            {
                                d.BillDetailsID,
                                d.BillID,
                                d.PerfumeID,
                                PerfumeName = d.Perfume.PerfumeName,
                                d.Quantity,
                                d.UnitPrice,
                                d.TotalPrice
                            })
                            .ToList();

            if (details == null || details.Count == 0)
                return NotFound();

            return Ok(details);
        }
    }
}
