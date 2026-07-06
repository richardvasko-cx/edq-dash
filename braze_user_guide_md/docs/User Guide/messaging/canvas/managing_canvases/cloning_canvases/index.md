# Clone Canvases to Canvas Flow

> If you have an existing Canvas from the original editor, you can clone this Canvas to create a copy in Canvas Flow. By switching to the current Canvas workflow, you gain access to lightweight [Canvas components](https://www.braze.com/docs/user_guide/messaging/canvas/canvas_components/), [persistent entry properties](https://www.braze.com/docs/user_guide/messaging/canvas/create_a_canvas/#canvas-entry-properties), and [post-launch editing](https://www.braze.com/docs/post-launch_edits). Your original Canvas will not be altered or deleted.

**Important:**


You can no longer create or duplicate Canvases using the original Canvas experience. Braze recommends that customers who use the original Canvas experience move to Canvas Flow, the current Canvas experience.



To clone your Canvas, do the following:

1. Go to the Canvas dashboard. 
2. Identify the Canvas you want to create a copy of in the Canvas Flow workflow. You can clone Canvases with a **Draft**, **Active**, or **Stopped** status. 
3. Click <i class="fas fa-ellipsis-vertical"></i> **More actions** and select **Clone to Canvas Flow**.

![](https://www.braze.com/docs/assets/img_archive/clone_to_v2_workflow.png?21828e1cc6b1fdbcee95cb74e5e1c4d0){: style="max-width:25%;"}

{: start="4"}
4. Enter the name of your new Canvas and click **Clone to Canvas Flow**. 

![](https://www.braze.com/docs/assets/img_archive/clone_to_v2_modal.png?0668006801d64875cebfcb0760772fca){: style="max-width:70%;"}

Now, you have two versions of your Canvas: the original Canvas and the Canvas Flow version. Your original Canvas still has its original status, and the cloned Canvas has a **Draft** status. You can still access the original Canvas, but Braze recommends using the Canvas Flow workflow to continue building your Canvases.

Previously, some Canvases with branching were unable to be cloned. Now, you can clone Canvases with branching. Note that cloning Canvases with branching may result in disconnected steps. Resolve these disconnected steps (steps that don't have a preceding step connected to them) to makes sure your Canvas journey is mapped properly.

**Note:**


If you clone an active Canvas, Braze will continue to send users through the original Canvas. We recommend stopping a Canvas before cloning to avoid sending duplicate messages to users from both Canvases.



![Canvas dashboard with two Canvases listed: V2 Copy of Canvas V1 and Canvas V1. The V2 Copy of Canvas V1 has an icon that indicates it is using the Canvas Flow workflow.](https://www.braze.com/docs/assets/img_archive/clone_to_v2_dashboard.png?2a6067e323f8d3ca539473bbfa28387a)

You've completed cloning your Canvas into the Canvas Flow workflow. Now, you can continue building your Canvases in this updated experience!

## Recommendations

To allow existing users to continue their user journey after you've cloned your original Canvas to Canvas Flow, you can add filters to your existing Canvas which prevent new users from entering the new Canvas.

If re-eligibility is off, add the filter "Entered Canvas Variation". If re-eligibility is on, these are the possible methods to consider to ensure that users don't enter the same Canvas twice:
- Update the existing Canvas to include a unique tag. For the new Canvas, add a filter "Last Received Message from Campaign or Canvas with Tag". This prevents users from entering the Canvas twice after a specific entry date (total number of days after the last message is sent from the original Canvas plus the conversion window). 
- **The following method will log data points.** Update the original Canvas to include a Braze-to-Braze webhook that triggers a custom attribute date timestamp upon entry. This attribute can be used to prevent users from entering the new Canvas after the specified date (total number of days after the last message is sent from the original Canvas plus the conversion window).

For API-triggered Canvases, coordinate with your engineering team to ensure that these Canvases are using the new Canvas ID when the new Canvases are ready to launch.

For more information about the differences between the original Canvas editor and Canvas Flow experience, check out [Canvas FAQ](https://www.braze.com/docs/user_guide/messaging/canvas/faqs/#what-are-the-main-differences-between-canvas-flow-and-the-original-canvas-editor).


