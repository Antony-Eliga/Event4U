namespace Event4U.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _event : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Events", "dateFin", c => c.DateTime(nullable: false));
            AddColumn("dbo.Events", "descriptif", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Events", "descriptif");
            DropColumn("dbo.Events", "dateFin");
        }
    }
}
