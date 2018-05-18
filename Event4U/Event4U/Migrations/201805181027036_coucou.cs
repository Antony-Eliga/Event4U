namespace Event4U.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class coucou : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Images",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Path = c.String(),
                        Event_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Events", t => t.Event_Id)
                .Index(t => t.Event_Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Images", "Event_Id", "dbo.Events");
            DropIndex("dbo.Images", new[] { "Event_Id" });
            DropTable("dbo.Images");
        }
    }
}
